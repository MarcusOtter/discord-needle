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

import fs from "fs";
import os from "os";
import path from "path";

export default class LastOnlineTracker {
	private readonly stateFilePath: string;
	private heartbeat: NodeJS.Timeout | undefined;

	public constructor(stateFilePath?: string) {
		this.stateFilePath = stateFilePath ?? path.join(os.tmpdir(), "needle-last-online.json");
	}

	public getLastOnline(): number | undefined {
		try {
			const fileContents = fs.readFileSync(this.stateFilePath, { encoding: "utf-8" });
			const parsed = JSON.parse(fileContents) as { lastOnline?: number };
			return typeof parsed.lastOnline === "number" ? parsed.lastOnline : undefined;
		} catch {
			return undefined;
		}
	}

	public start(): void {
		this.writeTimestamp();
		this.heartbeat = setInterval(() => this.writeTimestamp(), 60_000);
	}

	public stop(): void {
		if (this.heartbeat) {
			clearInterval(this.heartbeat);
			this.heartbeat = undefined;
		}
	}

	private writeTimestamp(): void {
		try {
			fs.mkdirSync(path.dirname(this.stateFilePath), { recursive: true });
			fs.writeFileSync(this.stateFilePath, JSON.stringify({ lastOnline: Date.now() }));
		} catch (error) {
			console.error("Failed to write last online timestamp", error);
		}
	}
}
