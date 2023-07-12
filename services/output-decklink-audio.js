"use strict";

const logger = require("@utils/logger")(module);
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const filterCombine = require("@services/filter-combine");
const filterText = require("@services/filter-text");
const filterQr = require("@services/filter-qr");

let command;

module.exports = async (cardIndex,options) => {
    let status = true
    let repeat = "";
    const outputFPS = 25;
    ffmpeg.setFfmpegPath("/root/bin/ffmpeg");

    const filters = await filterCombine(await filterText(options));

    if(options.repeat){
        repeat = "-stream_loop -1"
    }

    if(command){
        logger.info("Killing already running FFMPEG process")
        await command.kill()
    }

    const audioFilePath = path.join(__dirname, "..", "data", "media", options?.filename);
    const backgroundFilePath = path.join(__dirname, "..", "data", "media", options?.background || "test.png");

    command = ffmpeg({ logger: logger })
        .input(backgroundFilePath)
        .inputOptions([`-re`,repeat])
        .inputOptions([`-loop 1`])
        .input(audioFilePath)
        .outputOptions("-shortest")
        .outputOptions(["-pix_fmt uyvy422","-s 1920x1080","-ac 2","-f decklink","-probesize 32","-analyzeduration 32","-flags low_delay"])
        .output(options.cardName);
        
    if(Array.isArray(filters)){
        command.videoFilters(filters)
    }
         
    // if(options?.qr){
    //     command = await filterQr(command, options.qr);
    // }

    command.on("end", () => {
        logger.info("Finished playing file");
    });

    command.on("error", (error) => {
        logger.warn(error)
        logger.info("FFMPEG process killed");
    });

    command.on("start", (commandString) => {
        logger.debug(`Spawned FFmpeg with command: ${commandString}`);
        return { options: options, command: commandString };
    });

    command.on("progress", (progress) => {
        logger.info("ffmpeg-progress: " + Math.floor(progress.percent) + "% done");
    });

    command.on("stderr", function (stderrLine) {
        logger.info("ffmpeg: " + stderrLine);
    });

    try{
        command.run();
    }
    catch(error){
        logger.warn(error)
        status = "false"
    }

    return { error: status, options: options };
};
