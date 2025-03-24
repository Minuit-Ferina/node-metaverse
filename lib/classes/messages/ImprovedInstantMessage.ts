// This file has been automatically generated by writeMessageClasses.js

import { UUID } from '../UUID';
import { Vector3 } from '../Vector3';
import { MessageFlags } from '../../enums/MessageFlags';
import { MessageBase } from '../MessageBase';
import { Message } from '../../enums/Message';

export class ImprovedInstantMessageMessage implements MessageBase
{
    name = 'ImprovedInstantMessage';
    messageFlags = MessageFlags.Zerocoded | MessageFlags.FrequencyLow;
    id = Message.ImprovedInstantMessage;

    AgentData: {
        AgentID: UUID;
        SessionID: UUID;
    };
    MessageBlock: {
        FromGroup: boolean;
        ToAgentID: UUID;
        ParentEstateID: number;
        RegionID: UUID;
        Position: Vector3;
        Offline: number;
        Dialog: number;
        ID: UUID;
        Timestamp: number;
        FromAgentName: Buffer;
        Message: Buffer;
        BinaryBucket: Buffer;
    };
    EstateBlock: {
        EstateID: number;
    };
    MetaData: {
        Data: Buffer;
    }[];

    getSize(): number
    {
        return (this.MessageBlock['FromAgentName'].length + 1 + this.MessageBlock['Message'].length + 2 + this.MessageBlock['BinaryBucket'].length + 2) + this.calculateVarVarSize(this.MetaData, 'Data', 2) + 108;
    }

    calculateVarVarSize(block: { [key: string]: any }[], paramName: string, extraPerVar: number): number
    {
        let size = 0;
        for (const bl of block)
        {
            size += bl[paramName].length + extraPerVar;
        }
        return size;
    }

    // @ts-ignore
    writeToBuffer(buf: Buffer, pos: number): number
    {
        const startPos = pos;
        this.AgentData['AgentID'].writeToBuffer(buf, pos);
        pos += 16;
        this.AgentData['SessionID'].writeToBuffer(buf, pos);
        pos += 16;
        buf.writeUInt8((this.MessageBlock['FromGroup']) ? 1 : 0, pos++);
        this.MessageBlock['ToAgentID'].writeToBuffer(buf, pos);
        pos += 16;
        buf.writeUInt32LE(this.MessageBlock['ParentEstateID'], pos);
        pos += 4;
        this.MessageBlock['RegionID'].writeToBuffer(buf, pos);
        pos += 16;
        this.MessageBlock['Position'].writeToBuffer(buf, pos, false);
        pos += 12;
        buf.writeUInt8(this.MessageBlock['Offline'], pos++);
        buf.writeUInt8(this.MessageBlock['Dialog'], pos++);
        this.MessageBlock['ID'].writeToBuffer(buf, pos);
        pos += 16;
        buf.writeUInt32LE(this.MessageBlock['Timestamp'], pos);
        pos += 4;
        buf.writeUInt8(this.MessageBlock['FromAgentName'].length, pos++);
        this.MessageBlock['FromAgentName'].copy(buf, pos);
        pos += this.MessageBlock['FromAgentName'].length;
        buf.writeUInt16LE(this.MessageBlock['Message'].length, pos);
        pos += 2;
        this.MessageBlock['Message'].copy(buf, pos);
        pos += this.MessageBlock['Message'].length;
        buf.writeUInt16LE(this.MessageBlock['BinaryBucket'].length, pos);
        pos += 2;
        this.MessageBlock['BinaryBucket'].copy(buf, pos);
        pos += this.MessageBlock['BinaryBucket'].length;
        buf.writeUInt32LE(this.EstateBlock['EstateID'], pos);
        pos += 4;
        const count = this.MetaData.length;
        buf.writeUInt8(this.MetaData.length, pos++);
        for (let i = 0; i < count; i++)
        {
            buf.writeUInt16LE(this.MetaData[i]['Data'].length, pos);
            pos += 2;
            this.MetaData[i]['Data'].copy(buf, pos);
            pos += this.MetaData[i]['Data'].length;
        }
        return pos - startPos;
    }

    // @ts-ignore
    readFromBuffer(buf: Buffer, pos: number): number
    {
        const startPos = pos;
        let varLength = 0;
        const newObjAgentData: {
            AgentID: UUID,
            SessionID: UUID
        } = {
            AgentID: UUID.zero(),
            SessionID: UUID.zero()
        };
        newObjAgentData['AgentID'] = new UUID(buf, pos);
        pos += 16;
        newObjAgentData['SessionID'] = new UUID(buf, pos);
        pos += 16;
        this.AgentData = newObjAgentData;
        const newObjMessageBlock: {
            FromGroup: boolean,
            ToAgentID: UUID,
            ParentEstateID: number,
            RegionID: UUID,
            Position: Vector3,
            Offline: number,
            Dialog: number,
            ID: UUID,
            Timestamp: number,
            FromAgentName: Buffer,
            Message: Buffer,
            BinaryBucket: Buffer
        } = {
            FromGroup: false,
            ToAgentID: UUID.zero(),
            ParentEstateID: 0,
            RegionID: UUID.zero(),
            Position: Vector3.getZero(),
            Offline: 0,
            Dialog: 0,
            ID: UUID.zero(),
            Timestamp: 0,
            FromAgentName: Buffer.allocUnsafe(0),
            Message: Buffer.allocUnsafe(0),
            BinaryBucket: Buffer.allocUnsafe(0)
        };
        newObjMessageBlock['FromGroup'] = (buf.readUInt8(pos++) === 1);
        newObjMessageBlock['ToAgentID'] = new UUID(buf, pos);
        pos += 16;
        newObjMessageBlock['ParentEstateID'] = buf.readUInt32LE(pos);
        pos += 4;
        newObjMessageBlock['RegionID'] = new UUID(buf, pos);
        pos += 16;
        newObjMessageBlock['Position'] = new Vector3(buf, pos, false);
        pos += 12;
        newObjMessageBlock['Offline'] = buf.readUInt8(pos++);
        newObjMessageBlock['Dialog'] = buf.readUInt8(pos++);
        newObjMessageBlock['ID'] = new UUID(buf, pos);
        pos += 16;
        newObjMessageBlock['Timestamp'] = buf.readUInt32LE(pos);
        pos += 4;
        varLength = buf.readUInt8(pos++);
        newObjMessageBlock['FromAgentName'] = buf.slice(pos, pos + varLength);
        pos += varLength;
        varLength = buf.readUInt16LE(pos);
        pos += 2;
        newObjMessageBlock['Message'] = buf.slice(pos, pos + varLength);
        pos += varLength;
        varLength = buf.readUInt16LE(pos);
        pos += 2;
        newObjMessageBlock['BinaryBucket'] = buf.slice(pos, pos + varLength);
        pos += varLength;
        this.MessageBlock = newObjMessageBlock;
        const newObjEstateBlock: {
            EstateID: number
        } = {
            EstateID: 0
        };
        newObjEstateBlock['EstateID'] = buf.readUInt32LE(pos);
        pos += 4;
        this.EstateBlock = newObjEstateBlock;
        if (pos >= buf.length)
        {
            return pos - startPos;
        }
        const count = buf.readUInt8(pos++);
        this.MetaData = [];
        for (let i = 0; i < count; i++)
        {
            const newObjMetaData: {
                Data: Buffer
            } = {
                Data: Buffer.allocUnsafe(0)
            };
            varLength = buf.readUInt16LE(pos);
            pos += 2;
            newObjMetaData['Data'] = buf.slice(pos, pos + varLength);
            pos += varLength;
            this.MetaData.push(newObjMetaData);
        }
        return pos - startPos;
    }
}

