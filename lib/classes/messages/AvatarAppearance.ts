// This file has been automatically generated by writeMessageClasses.js

import { UUID } from '../UUID';
import { Vector3 } from '../Vector3';
import { MessageFlags } from '../../enums/MessageFlags';
import { MessageBase } from '../MessageBase';
import { Message } from '../../enums/Message';

export class AvatarAppearanceMessage implements MessageBase
{
    name = 'AvatarAppearance';
    messageFlags = MessageFlags.Trusted | MessageFlags.Zerocoded | MessageFlags.FrequencyLow;
    id = Message.AvatarAppearance;

    Sender: {
        ID: UUID;
        IsTrial: boolean;
    };
    ObjectData: {
        TextureEntry: Buffer;
    };
    VisualParam: {
        ParamValue: number;
    }[];
    AppearanceData: {
        AppearanceVersion: number;
        CofVersion: number;
        Flags: number;
    }[];
    AppearanceHover: {
        HoverHeight: Vector3;
    }[];
    AttachmentBlock: {
        ID: UUID;
        AttachmentPoint: number;
    }[];

    getSize(): number
    {
        return (this.ObjectData['TextureEntry'].length + 2) + ((1) * this.VisualParam.length) + ((9) * this.AppearanceData.length) + ((12) * this.AppearanceHover.length) + ((17) * this.AttachmentBlock.length) + 21;
    }

    // @ts-ignore
    writeToBuffer(buf: Buffer, pos: number): number
    {
        const startPos = pos;
        this.Sender['ID'].writeToBuffer(buf, pos);
        pos += 16;
        buf.writeUInt8((this.Sender['IsTrial']) ? 1 : 0, pos++);
        buf.writeUInt16LE(this.ObjectData['TextureEntry'].length, pos);
        pos += 2;
        this.ObjectData['TextureEntry'].copy(buf, pos);
        pos += this.ObjectData['TextureEntry'].length;
        let count = this.VisualParam.length;
        buf.writeUInt8(this.VisualParam.length, pos++);
        for (let i = 0; i < count; i++)
        {
            buf.writeUInt8(this.VisualParam[i]['ParamValue'], pos++);
        }
        count = this.AppearanceData.length;
        buf.writeUInt8(this.AppearanceData.length, pos++);
        for (let i = 0; i < count; i++)
        {
            buf.writeUInt8(this.AppearanceData[i]['AppearanceVersion'], pos++);
            buf.writeInt32LE(this.AppearanceData[i]['CofVersion'], pos);
            pos += 4;
            buf.writeUInt32LE(this.AppearanceData[i]['Flags'], pos);
            pos += 4;
        }
        count = this.AppearanceHover.length;
        buf.writeUInt8(this.AppearanceHover.length, pos++);
        for (let i = 0; i < count; i++)
        {
            this.AppearanceHover[i]['HoverHeight'].writeToBuffer(buf, pos, false);
            pos += 12;
        }
        count = this.AttachmentBlock.length;
        buf.writeUInt8(this.AttachmentBlock.length, pos++);
        for (let i = 0; i < count; i++)
        {
            this.AttachmentBlock[i]['ID'].writeToBuffer(buf, pos);
            pos += 16;
            buf.writeUInt8(this.AttachmentBlock[i]['AttachmentPoint'], pos++);
        }
        return pos - startPos;
    }

    // @ts-ignore
    readFromBuffer(buf: Buffer, pos: number): number
    {
        const startPos = pos;
        let varLength = 0;
        const newObjSender: {
            ID: UUID,
            IsTrial: boolean
        } = {
            ID: UUID.zero(),
            IsTrial: false
        };
        newObjSender['ID'] = new UUID(buf, pos);
        pos += 16;
        newObjSender['IsTrial'] = (buf.readUInt8(pos++) === 1);
        this.Sender = newObjSender;
        const newObjObjectData: {
            TextureEntry: Buffer
        } = {
            TextureEntry: Buffer.allocUnsafe(0)
        };
        varLength = buf.readUInt16LE(pos);
        pos += 2;
        newObjObjectData['TextureEntry'] = buf.slice(pos, pos + varLength);
        pos += varLength;
        this.ObjectData = newObjObjectData;
        if (pos >= buf.length)
        {
            return pos - startPos;
        }
        let count = buf.readUInt8(pos++);
        this.VisualParam = [];
        for (let i = 0; i < count; i++)
        {
            const newObjVisualParam: {
                ParamValue: number
            } = {
                ParamValue: 0
            };
            newObjVisualParam['ParamValue'] = buf.readUInt8(pos++);
            this.VisualParam.push(newObjVisualParam);
        }
        if (pos >= buf.length)
        {
            return pos - startPos;
        }
        count = buf.readUInt8(pos++);
        this.AppearanceData = [];
        for (let i = 0; i < count; i++)
        {
            const newObjAppearanceData: {
                AppearanceVersion: number,
                CofVersion: number,
                Flags: number
            } = {
                AppearanceVersion: 0,
                CofVersion: 0,
                Flags: 0
            };
            newObjAppearanceData['AppearanceVersion'] = buf.readUInt8(pos++);
            newObjAppearanceData['CofVersion'] = buf.readInt32LE(pos);
            pos += 4;
            newObjAppearanceData['Flags'] = buf.readUInt32LE(pos);
            pos += 4;
            this.AppearanceData.push(newObjAppearanceData);
        }
        if (pos >= buf.length)
        {
            return pos - startPos;
        }
        count = buf.readUInt8(pos++);
        this.AppearanceHover = [];
        for (let i = 0; i < count; i++)
        {
            const newObjAppearanceHover: {
                HoverHeight: Vector3
            } = {
                HoverHeight: Vector3.getZero()
            };
            newObjAppearanceHover['HoverHeight'] = new Vector3(buf, pos, false);
            pos += 12;
            this.AppearanceHover.push(newObjAppearanceHover);
        }
        if (pos >= buf.length)
        {
            return pos - startPos;
        }
        count = buf.readUInt8(pos++);
        this.AttachmentBlock = [];
        for (let i = 0; i < count; i++)
        {
            const newObjAttachmentBlock: {
                ID: UUID,
                AttachmentPoint: number
            } = {
                ID: UUID.zero(),
                AttachmentPoint: 0
            };
            newObjAttachmentBlock['ID'] = new UUID(buf, pos);
            pos += 16;
            newObjAttachmentBlock['AttachmentPoint'] = buf.readUInt8(pos++);
            this.AttachmentBlock.push(newObjAttachmentBlock);
        }
        return pos - startPos;
    }
}

