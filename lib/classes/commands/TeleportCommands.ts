import { CommandsBase } from './CommandsBase';
import { Region } from '../Region';
import { TeleportEventType } from '../../enums/TeleportEventType';
import { TeleportLureRequestMessage } from '../messages/TeleportLureRequest';
import type { Vector3 } from '../Vector3';
import { TeleportLocationRequestMessage } from '../messages/TeleportLocationRequest';
import type * as Long from 'long';
import type { Agent } from '../Agent';
import type { Subscription } from 'rxjs';
import type { TeleportEvent } from '../../events/TeleportEvent';
import type { LureEvent } from '../../events/LureEvent';
import { TeleportFlags } from '../../enums/TeleportFlags';
import { PacketFlags } from '../../enums/PacketFlags';
import type { RegionInfoReplyEvent } from '../../events/RegionInfoReplyEvent';
import type { Bot } from '../../Bot';
import { Utils } from '../Utils';

export class TeleportCommands extends CommandsBase
{
    private expectingTeleport = false;
    private readonly teleportSubscription: Subscription;

    public constructor(region: Region, agent: Agent, bot: Bot)
    {
        super(region, agent, bot);
        this.teleportSubscription = this.bot.clientEvents.onTeleportEvent.subscribe((e: TeleportEvent) =>
        {
            if (e.eventType === TeleportEventType.TeleportCompleted)
            {
                if (!this.expectingTeleport)
                {
                    if (e.simIP === 'local')
                    {
                        // Local TP - no need for any other shindiggery
                        return;
                    }

                    const newRegion: Region = new Region(this.agent, this.bot.clientEvents, this.currentRegion.options);
                    newRegion.circuit.circuitCode = this.currentRegion.circuit.circuitCode;
                    newRegion.circuit.secureSessionID = this.currentRegion.circuit.secureSessionID;
                    newRegion.circuit.sessionID = this.currentRegion.circuit.sessionID;
                    newRegion.circuit.udpBlacklist = this.currentRegion.circuit.udpBlacklist;
                    newRegion.circuit.ipAddress = e.simIP;
                    newRegion.circuit.port = e.simPort;
                    newRegion.activateCaps(e.seedCapability);

                    this.bot.changeRegion(newRegion, false).then(() =>
                    {
                        // Change region successful
                    }).catch((error: unknown) =>
                    {
                        console.log('Failed to change region');
                        console.error(error);
                    });
                }
            }
        });
    }

    public override shutdown(): void
    {
        this.teleportSubscription.unsubscribe();
    }

    public async acceptTeleport(lure: LureEvent): Promise<TeleportEvent>
    {
        const {circuit} = this.currentRegion;
        const tlr = new TeleportLureRequestMessage();
        tlr.Info = {
            AgentID: this.agent.agentID,
            SessionID: circuit.sessionID,
            LureID: lure.lureID,
            TeleportFlags: TeleportFlags.ViaLure
        };
        circuit.sendMessage(tlr, PacketFlags.Reliable);
        return this.awaitTeleportEvent(true)
    }

    public async teleportToRegionCoordinates(x: number, y: number, position: Vector3, lookAt: Vector3): Promise<TeleportEvent>
    {
        const globalPos = Utils.RegionCoordinatesToHandle(x, y);
        return this.teleportToHandle(globalPos.regionHandle, position, lookAt);
    }

    public async teleportToHandle(handle: Long, position: Vector3, lookAt: Vector3): Promise<TeleportEvent>
    {
        return new Promise<TeleportEvent>((resolve, reject) =>
        {
            const rtm = new TeleportLocationRequestMessage();
            rtm.AgentData = {
                AgentID: this.agent.agentID,
                SessionID: this.circuit.sessionID
            };
            rtm.Info = {
                LookAt: lookAt,
                Position: position,
                RegionHandle: handle
            };
            this.circuit.sendMessage(rtm, PacketFlags.Reliable);
            this.awaitTeleportEvent(true).then((event: TeleportEvent) =>
            {
                resolve(event);
            }).catch((err: unknown) =>
            {
                if (err instanceof Error)
                {
                    reject(err);
                }
                else
                {
                    reject(new Error('Failed to teleport'));
                }
            });
        });
    }

    public async teleportTo(regionName: string, position: Vector3, lookAt: Vector3): Promise<TeleportEvent>
    {
        const region: RegionInfoReplyEvent = await this.bot.clientCommands.grid.getRegionByName(regionName);
        return this.teleportToHandle(region.handle, position, lookAt);
    }

    private async awaitTeleportEvent(requested: boolean): Promise<TeleportEvent>
    {
        return new Promise<TeleportEvent>((resolve, reject) =>
        {
            if (this.currentRegion.caps.eventQueueClient)
            {
                if (this.bot.clientEvents === null)
                {
                    reject(new Error('ClientEvents is null'));
                    return;
                }
                this.expectingTeleport = true;
                const subscription = this.bot.clientEvents.onTeleportEvent.subscribe((e: TeleportEvent) =>
                {
                    if (e.eventType === TeleportEventType.TeleportFailed || e.eventType === TeleportEventType.TeleportCompleted)
                    {
                        setTimeout(() =>
                        {
                            this.expectingTeleport = false;
                        });
                        subscription.unsubscribe();
                    }
                    if (e.eventType === TeleportEventType.TeleportFailed)
                    {
                        reject(new class extends Error
                        {
                            public teleportEvent: TeleportEvent = e;
                            public constructor()
                            {
                                super('Teleport failed')
                            }
                        });
                    }
                    else if (e.eventType === TeleportEventType.TeleportCompleted)
                    {
                        if (e.simIP === 'local')
                        {
                            // Local TP - no need for any other shindiggery
                            resolve(e);
                            return;
                        }

                        if (this.bot.clientEvents === null)
                        {
                            reject(new Error('ClientEvents is null'));
                            return;
                        }

                        // Successful teleport! First, rip apart circuit
                        const region: Region = new Region(this.agent, this.bot.clientEvents, this.currentRegion.options);
                        region.circuit.circuitCode = this.currentRegion.circuit.circuitCode;
                        region.circuit.secureSessionID = this.currentRegion.circuit.secureSessionID;
                        region.circuit.sessionID = this.currentRegion.circuit.sessionID;
                        region.circuit.udpBlacklist = this.currentRegion.circuit.udpBlacklist;
                        region.circuit.ipAddress = e.simIP;
                        region.circuit.port = e.simPort;
                        region.activateCaps(e.seedCapability);

                        this.bot.changeRegion(region, requested).then(() =>
                        {
                            resolve(e);
                        }).catch((error: unknown) =>
                        {
                            if (error instanceof Error)
                            {
                                reject(error);
                            }
                            else
                            {
                                reject(new Error('Failed to teleport'));
                            }
                        });
                    }
                });
            }
            else
            {
                reject(new Error('EventQueue not ready'));
            }
        });
    }
}
