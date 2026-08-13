/**
 * スライドを書き出すプログラム
 *
 * 使い方:  npm run build
 *
 * content/ のファイルを1枚ずつ読んで、lib/layouts.js の型に流し込み、
 * PowerPoint ファイル（.pptx）を書き出します。
 *
 * 別の回のスライドを作るときは、下の DECK の行を差し替えてください。
 */

// ★ どの回のスライドを作るか
const DECK = "./content/2026-08-17_第2回_食と生活リズムの整え方";

const pptx = require("./lib/deck");
const layouts = require("./lib/layouts");
const deck = require(DECK);

pptx.author = deck.meta.author;
pptx.title = deck.meta.title;

deck.slides.forEach((slide, i) => {
  const build = layouts[slide.layout];
  if (!build) {
    throw new Error(
      `${i + 1}枚目: 「${slide.layout}」という型はありません。\n` +
      `使える型: ${Object.keys(layouts).join(", ")}`
    );
  }
  const s = build(slide);
  if (slide.notes) s.addNotes(slide.notes);
});

pptx.writeFile({ fileName: deck.meta.fileName }).then(() => {
  console.log(`written: ${deck.meta.fileName}（${deck.slides.length}枚）`);
});
