/*
This file is part of Needle.

Needle is free software: you can redistribute it and/or modify it under the terms of the GNU
Affero General Public License as published by the Free Software Foundation, either version 3 of
the License, or (at your option) any later version.

Needle is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with Needle.
If not, see <https://www.gnu.org/licenses/>.
*/

// TODO: write this migration script, make sure to make a backup too

// Emojis should be turned off by default (make people turn it on)
// Old configs should get the USER DATE title, new ones should default to 40 chars
// Variables have changed, $USER should be $USER_MENTION, etc

// Replace all \\n with actual \n

// Merged SUCCESS_THREAD_ARCHIVE_IMMEDIATE and SLOW to just SuccessThreadArchived
