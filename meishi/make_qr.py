"""QRコードを名刺用に書き出す。
使い方:  pip install qrcode pillow
        python3 meishi/make_qr.py https://lit.link/xxxxx
出力:    meishi/qr.png（余白最小・高解像度）
そのあと card.html / card_rx.html の
  <div class="qr-ph">QR<br>（差し替え）</div>
を
  <img src="qr.png" alt="QR">
に書き換えてください。
"""
import os, sys
import qrcode

url = sys.argv[1] if len(sys.argv) > 1 else sys.exit("URL を指定してください")
qr = qrcode.QRCode(version=None, error_correction=qrcode.constants.ERROR_CORRECT_H,
                   box_size=20, border=1)
qr.add_data(url); qr.make(fit=True)
img = qr.make_image(fill_color="#3E3A34", back_color="white")
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "qr.png")
img.save(out)
print("wrote", out, img.size)
