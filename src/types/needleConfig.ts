// ________________________________________________________________________________________________
//
// This file is part of Needle.
//
// Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
// Affero General Public License as published by the Free Software Foundation, either version 3 of
// the License, or (at your option) any later version.
//
// Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
// General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License along with Needle.
// If not, see <https://www.gnu.org/licenses/>.
//
// ________________________________________________________________________________________________

export interface NeedleConfig {
    threadChannels?: { channelId: string, messageContent: string }[];
    archiveImmediately: boolean;
    messages?: {
        ERR_UNKNOWN?: string,
        ERR_ONLY_IN_SERVER?: string,
        ERR_ONLY_IN_THREAD?: string,
        ERR_ONLY_THREAD_OWNER?: string,
        ERR_NO_EFFECT?: string,
        ERR_JSON_MISSING?: string,
        ERR_JSON_INVALID?: string,
        ERR_CONFIG_INVALID?: string;
        ERR_PARAMETER_MISSING?: string,
        ERR_INSUFFICIENT_PERMS?: string,
        ERR_CHANNEL_VISIBILITY?: string,
        ERR_THREAD_MESSAGE_MISSING?: string,

        SUCCESS_THREAD_CREATE?: string,
        SUCCESS_THREAD_ARCHIVE_IMMEDIATE?: string,
        SUCCESS_THREAD_ARCHIVE_SLOW?: string,
    },
}
