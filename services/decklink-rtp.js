"use strict";

const logger = require("@utils/logger")(module);
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const jobManager = require("@utils/jobManager");
const filterCombine = require("@utils/filter-combine");
const filterText = require("@utils/filter-text");
const setCodec = require("@utils/set-codec");

const process = async (options) => {
    const response = { options: options };
    ffmpeg.setFfmpegPath("/root/bin/ffmpeg");

    try {
        const job = jobManager.start(
            options.cardName,
            `${options.cardName} to RTP rtp://${options.address}:${options.port}`,
            ["encode", "rtp", "decklink"]
        );

        const filters = await filterCombine(await filterText({ ...options, ...job }));

        const command = ffmpeg({ logger: logger })
            .input(options.cardName)
            .inputFormat("decklink")
            .inputOptions(["-protocol_whitelist", "srt,udp,rtp", "-stats", "-re"])
            .output(
                `rtp://${options.address}:${options.port}?pkt_size=${options?.packetSize || 1316}&buffer_size=${
                    options?.buffer || 65535
                }`
            )
            .outputOptions([
                "-f rtp",
                `-reorder_queue_size ${options?.jitterBuffer || "25"}`,
                "-flags low_delay",
                "-muxdelay 0",
                `-b:v ${options?.bitrate || "5M"}`,
            ]);

        if (!options.vbr) {
            command.outputOptions([
                `-minrate ${options?.bitrate || "5M"}`,
                `-maxrate ${options?.bitrate || "5M"}`,
                `-bufsize 500K`,
            ]);
        } else {
            command.outputOptions([
                `-minrate ${options?.minBitrate || "5M"}`,
                `-maxrate ${options?.maxBitrate || "5M"}`,
                `-bufsize 500K`,
            ]);
        }

        command = setCodec(command, options);

        if (Array.isArray(filters)) {
            command.videoFilters(filters);
        }

        if (options?.thumbnail) {
            command
                .output(path.join(__dirname, "..", "data", "thumbnail", `${job?.jobId}.png`))
                .outputOptions([`-r ${options?.thumbnailFrequency || 1}`, "-update 1"]);

            if (Array.isArray(filters)) {
                command.videoFilters(filters);
            }
        }

        command.on("end", () => {
            logger.info("Finished encoding decklink card to UDP");
            jobManager.end(job?.jobId, false);
        });
        command.on("start", (commandString) => {
            logger.debug(`Spawned FFmpeg with command: ${commandString}`);
            jobManager.update(job?.jobId, { command: commandString, pid: command.ffmpegProc.pid, options: options });
            return { options: options, command: commandString };
        });

        command.on("stderr", function (stderrLine) {
            logger.info("ffmpeg: " + stderrLine);
        });

        command.on("error", function (error) {
            logger.error(error);
            jobManager.end(job?.jobId, false);

            //If IO Error (Network error, restart)
            if (error.toString().includes("Input/output error") || error.toString().includes("Conversion failed!")) {
                logger.info("Restarting due to IO error");
                process(options);
            }
        });

        command.run();
    } catch (error) {
        logger.error(error.message);
        response.error = error.message;
    }

    response.job = await jobManager.get(options.cardName);
    return response;
};

module.exports = process;
