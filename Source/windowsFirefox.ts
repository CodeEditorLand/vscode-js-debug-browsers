/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { promises as fsPromises } from "fs";
import { win32 } from "path";

import { IBrowserFinder, IExecutable, Quality } from "./index";
import { findWindowsCandidates, preferredFirefoxPath } from "./util";

/**
 * Finds the Chrome browser on Windows.
 */
export class WindowsFirefoxBrowserFinder implements IBrowserFinder {
	constructor(
		private readonly env: NodeJS.ProcessEnv = process.env,
		private readonly fs: typeof fsPromises = fsPromises,
	) {}

	public async findWhere(predicate: (exe: IExecutable) => boolean) {
		return (await this.findAll()).find(predicate);
	}

	public async findAll() {
		const sep = win32.sep;

		const suffixes = [
			{
				name: `${sep}Firefox Developer Edition${sep}firefox.exe`,
				type: Quality.Dev,
			},
			{
				name: `${sep}Firefox Nightly${sep}firefox.exe`,
				type: Quality.Canary,
			},
			{
				name: `${sep}Mozilla Firefox${sep}firefox.exe`,
				type: Quality.Stable,
			},
		];

		const installations = await findWindowsCandidates(
			this.env,
			this.fs,
			suffixes,
		);

		const customFirefoxPath = await preferredFirefoxPath(this.fs, this.env);

		if (customFirefoxPath) {
			installations.unshift({
				path: customFirefoxPath,
				quality: Quality.Custom,
			});
		}

		return installations;
	}
}
