/**
 * 黒い画面での1行入力。
 *
 * readline は端末の制御文字を先に流すため、質問文が消えて
 * 「止まったように見える」ことがあった。ここでは質問文を自分で表示し、
 * キー入力を直接受け取る。hidden=true のときは打った文字を画面に出さない。
 */

let carry = "";   // 端末以外のとき、1回の入力に次の行まで含まれることがある

function prompt(question, hidden = false) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(question);

    // すでに読み込み済みの行が残っていればそれを使う
    const ready = carry.indexOf("\n");
    if (ready >= 0) {
      const line = carry.slice(0, ready);
      carry = carry.slice(ready + 1);
      process.stdout.write("\n");
      return resolve(line.trim());
    }

    let buffer = "";
    let finished = false;
    const isTty = stdin.isTTY && typeof stdin.setRawMode === "function";

    const finish = () => {
      if (finished) return;
      finished = true;
      stdin.removeListener("data", onData);
      stdin.removeListener("end", finish);
      if (isTty) stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write("\n");
      resolve(buffer.trim());
    };

    const onData = (chunk) => {
      if (!isTty) {
        // 端末でない場合（テストなど）は改行まで貯め、余りは次の質問に回す
        buffer += String(chunk);
        const br = buffer.indexOf("\n");
        if (br >= 0) {
          carry = buffer.slice(br + 1);
          buffer = buffer.slice(0, br);
          finish();
        }
        return;
      }
      for (const ch of String(chunk)) {
        if (ch === "\r" || ch === "\n") return finish();
        if (ch === "\u0003") { process.stdout.write("\n"); process.exit(1); }       // Ctrl+C
        if (ch === "\u0008" || ch === "\u007f") {                                  // BackSpace
          if (buffer) {
            buffer = buffer.slice(0, -1);
            if (!hidden) process.stdout.write("\b \b");
          }
          continue;
        }
        if (ch < " ") continue;
        buffer += ch;
        if (!hidden) process.stdout.write(ch);
      }
    };

    // resume() より先に受け手を付ける（先に流すと入力を取りこぼす）
    stdin.on("data", onData);
    stdin.once("end", finish);   // 入力が尽きたらそこまでで確定
    stdin.setEncoding("utf8");
    if (isTty) stdin.setRawMode(true);
    stdin.resume();
  });
}


module.exports = { prompt };
