/**
 * PowerPoint ファイル本体（1つだけ作って、みんなで使い回します）
 *
 * このファイルは触る必要がありません。
 */
const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 16:9 のワイド

module.exports = pptx;
