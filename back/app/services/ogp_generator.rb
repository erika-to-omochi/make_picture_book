require 'rmagick'

class OgpGenerator
  def self.generate(title:, author:, output_path:)
    img = Magick::ImageList.new(Rails.root.join("app", "assets", "images", "ogp_template.png").to_s)

    draw = Magick::Draw.new
    draw.font = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"
    draw.pointsize = 50
    draw.fill = "#000000"
    draw.gravity = Magick::CenterGravity

    # タイトルを描画 (中央やや上に表示するためy座標を少し上方向に(-50)ずらす)
    draw.annotate(img, 0, 0, 0, -50, title)

    # 作者名を描画 (タイトルの下に表示するためy座標は正値で下方向にオフセット)
    draw.pointsize = 30
    draw.fill = "#000000"
    draw.annotate(img, 0, 0, 0, 50, " 作者： #{author}")

    # 画像を書き出し
    img.write(output_path)
  end
end
