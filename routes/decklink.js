"use strict";

const router = require("express").Router();
const hashResponse = require("@utils/hash-response");

const decklinkFile = require("@services/decklink-file");
const decklinkSrt = require("@services/decklink-srt");
const decklinkUdp = require("@services/decklink-udp");
const decklinkRtp = require("@services/decklink-rtp");
const decklinkRtmp = require("@services/decklink-rtmp");
const decklinkHls = require("@services/decklink-hls");

const decklinkConfigGet = require("@services/decklink-config-get");
const decklinkConfigSet = require("@services/decklink-config-set");

/**
 * @swagger
 * /decklink/file:
 *    post:
 *      description: Takes Decklink input in SDI and encodes it as a file.
 *      tags: [decklink]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.post("/file", async (req, res, next) => {
    const response = await decklinkFile(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /decklink/srt:
 *    post:
 *      description: Takes Decklink input in SDI and encodes it as SRT.
 *      tags: [decklink]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.post("/srt", async (req, res, next) => {
    const response = await decklinkSrt(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /decklink/udp:
 *    post:
 *      description: Takes Decklink input in SDI and encodes it as UDP.
 *      tags: [decklink]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.post("/udp", async (req, res, next) => {
    const response = await decklinkUdp(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /decklink/rtp:
 *    post:
 *      description: Takes Decklink input in SDI and encodes it as RTP.
 *      tags: [decklink]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.post("/rtp", async (req, res, next) => {
    const response = await decklinkUdp(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /decklink/rtmp:
 *    post:
 *      description: Takes Decklink input in SDI and encodes it as RTMP.
 *      tags: [decklink]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.post("/rtmp", async (req, res, next) => {
    const response = await decklinkRtmp(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /decklink/hls:
 *    post:
 *      description: Takes Decklink input in SDI and encodes it as HLS.
 *      tags: [decklink]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.post("/hls", async (req, res, next) => {
    const response = await decklinkHls(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /decklink:
 *    get:
 *      description: Gets the info about currently attached Decklink cards
 *      tags: [decklink]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.get("/", async (req, res, next) => {
    const response = await decklinkConfigGet();
    hashResponse(res, req, { ...response, ...{ status: response.error ? "error" : "success" } });
});

/**
 * @swagger
 * /decklink:
 *    post:
 *      description: Sets the config for an individual Decklink card
 *      tags: [decklink]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.post("/", async (req, res, next) => {
    const response = await decklinkConfigSet(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

module.exports = router;
