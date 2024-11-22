/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { promises as fsPromises } from "fs";
import { sep } from "path";

import { IBrowserFinder, IExecutable, Quality } from "./index";
import { findWindowsCandidates, preferredEdgePath } from "./util";

/**
 * Finds the Chrome browser on Windows.
 */
export class WindowsEdgeBrowserFinder implements IBrowserFinder {
	constructor(
		private readonly env: NodeJS.ProcessEnv = process.env,
		private readonly fs: typeof fsPromises = fsPromises,
	) {}

	public async findWhere(predicate: (exe: IExecutable) => boolean) {
		return (await this.findAll()).find(predicate);
	}

	public async findAll() {
		const suffixes = [
			{
				name: `${sep}Microsoft${sep}Edge SxS${sep}Application${sep}msedge.exe`,
				type: Quality.Canary,
			},
			{
				name: `${sep}Microsoft${sep}Edge Dev${sep}Application${sep}msedge.exe`,
				type: Quality.Dev,
			},
			{
				name: `${sep}Microsoft${sep}Edge Beta${sep}Application${sep}msedge.exe`,
				type: Quality.Beta,
			},
			{
				name: `${sep}Microsoft${sep}Edge${sep}Application${sep}msedge.exe`,
				type: Quality.Stable,
			},
		];

		const installations = await findWindowsCandidates(
			this.env,
			this.fs,
			suffixes,
		);

		const customEdgePath = await preferredEdgePath(this.fs, this.env);

		if (customEdgePath) {
			installations.unshift({
				path: customEdgePath,
				quality: Quality.Custom,
			});
		}

		return installations;
	}
}
