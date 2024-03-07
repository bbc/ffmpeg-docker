/*
FFmpeg Docker, an API wrapper around FFmpeg running in a configurable docker container
Copyright (C) 2022 Ryan McCartney

This file is part of the FFmpeg Docker (ffmpeg-docker).

FFmpeg Docker is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

"use strict";

const fs = require("fs").promises;
const path = require("path");
const logger = require("@utils/logger")(module);

module.exports = async (relativePath) => {
    try {
        const absolutePath = path.resolve(relativePath);
        if (await fs.unlink(absolutePath)) {
            return true;
        }
        return false;
    } catch (error) {
        logger.warn(error);
        return false;
    }
};
