// Copyright Epic Games, Inc. All Rights Reserved.

import { ITransport } from '../Transport/ITransport';
import { EventEmitter } from '../Event/EventEmitter';
import { BaseMessage } from '../Messages/base_message';
import { Logger } from '../Logger/Logger';

/**
 * Signalling protocol for handling messages from the signalling server.
 *
 * Listen on this emitter for messages. Message type is the name of the event to listen for.
 * Example:
 *      signallingProtocol.on('config', (message: Messages.config) =\> console.log(`Got a config message: ${message}`)));
 *
 * The transport in this class will also emit on message events.
 *
 * Events emitted on transport:
 *   message:
 *      Emitted any time a message is received by the transport. Listen on this if
 *      you wish to capture all messages, rather than specific messages on
 *      'messageHandlers'.
 *
 *   out:
 *      Emitted when sending a message out on the transport. Similar to 'message' but
 *      only for when messages are sent from this endpoint. Useful for debugging.
 */
export class SignallingProtocol extends EventEmitter {
    static get SIGNALLING_VERSION(): string {
        return '1.3.0';
    }

    // The transport in use by this protocol object.
    transport: ITransport;

    constructor(transport: ITransport) {
        super();
        this.transport = transport;

        transport.onMessage = (msg: string) => {
            let parsedMessage: BaseMessage;
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const parsedData = JSON.parse(msg);
                Logger.Debug('Protocol received => \n' + JSON.stringify(parsedData, undefined, 4));
                parsedMessage = parsedData as BaseMessage;
            } catch (e: unknown) {
                if (e instanceof Error) {
                    Logger.Error(`Error parsing message string ${msg}.\n${e.message}`);
                } else {
                    Logger.Error(`Unknown error while parsing message data in handleOnMessage`);
                }
                return;
            }

            // call the handlers
            transport.emit('message', parsedMessage); // emit this for listeners listening to any message
            if (!this.emit(parsedMessage.type, parsedMessage)) {
                // emit this for listeners listening for specific messages
                // no listeners
                this.emit('unhandled', parsedMessage);
            }
        };
    }

    /**
     * Asks the transport to connect to the given URL.
     * @param url - The url to connect to.
     * @returns True if the connection call succeeded.
     */
    connect(url: string): boolean {
        return this.transport.connect(url);
    }

    /**
     * Asks the transport to disconnect from any connection it might have.
     * @param code - An optional disconnection code.
     * @param reason - An optional descriptive string for the disconnect reason.
     */
    disconnect(code?: number, reason?: string): void {
        this.transport.disconnect(code, reason);
    }

    /**
     * Returns true if the transport is connected and ready to send/receive messages.
     * @returns True if the protocol is connected.
     */
    isConnected(): boolean {
        return this.transport.isConnected();
    }

    /**
     * Passes a message to the transport to send to the other end.
     * @param msg - The message to send.
     */
    sendMessage(msg: BaseMessage): void {
        this.transport.sendMessage(JSON.stringify(msg));
        this.transport.emit('out', msg); // emit this for listeners listening to outgoing messages
        Logger.Debug('Protocol sent => \n' + JSON.stringify(msg, undefined, 4));
    }
}
