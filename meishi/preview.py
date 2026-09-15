"""入稿用PDFから、断裁後（91×55mm）のプレビュー画像を書き出す。"""
import os
import pypdfium2 as pdfium
from PIL import Image

DIR = os.path.dirname(os.path.abspath(__file__))
SCALE = 5                                  # 5 × 72dpi = 360dpi
BLEED = round(3 / 25.4 * 72 * SCALE)       # 塗り足し3mm分

def sides(pdf):
    doc = pdfium.PdfDocument(os.path.join(DIR, pdf))
    out = []
    for page in doc:
        im = page.render(scale=SCALE).to_pil()
        w, h = im.size
        out.append(im.crop((BLEED, BLEED, w - BLEED, h - BLEED)))
    return out

def spread(images, path):
    gap, pad = 40, 40
    w = sum(i.width for i in images) + gap * (len(images) - 1) + pad * 2
    h = max(i.height for i in images) + pad * 2
    canvas = Image.new("RGB", (w, h), (237, 234, 226))
    x = pad
    for im in images:
        canvas.paste(im, (x, pad)); x += im.width + gap
    canvas.save(os.path.join(DIR, path))

front, back = sides("meishi_print.pdf")
front.save(os.path.join(DIR, "preview_front.png"))
back.save(os.path.join(DIR, "preview_back.png"))
spread([front, back], "preview.png")

_, back_rx = sides("meishi_rx_print.pdf")
back_rx.save(os.path.join(DIR, "preview_back_rx.png"))
spread([front, back_rx], "preview_rx.png")
print("preview images updated")
