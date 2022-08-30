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

import "dotenv/config";
import license from "./helpers/license.js";
import ObjectFactory from "./ObjectFactory.js";

console.log(license);
const bot = ObjectFactory.createNeedleBot();
await bot.loadDynamicImports();
await bot.connect();

process.on("SIGINT", async () => {
	await bot.disconnect();
	process.exit(0);
});
