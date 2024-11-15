class PageCharacter < ApplicationRecord
  belongs_to :page

  # Enumの定義
  enum character_type: {
    simple: 0,
    detailed: 1
  }

  validates :character_type, presence: true
  validates :position_x, :position_y, presence: true, numericality: { only_integer: true }
  validates :rotation, numericality: { only_integer: true }
  validates :scale_x, :scale_y, numericality: { greater_than: 0 }

  # バリデーション - 詳細パーツに関する制約（必要に応じて）
  validate :validate_paths_for_detailed_character

  private

  # キャラクタータイプが "detailed" の場合、詳細パーツのパスが必要
  def validate_paths_for_detailed_character
    if detailed?
      required_paths = [:body_path, :hair_path, :eye_path, :mouth_path, :hand_path, :foot_path, :outfit_path]
      missing_paths = required_paths.select { |path| send(path).blank? }

      if missing_paths.any?
        errors.add(
          :base,
          :detailed_character_missing_paths,
          paths: missing_paths.join(', ')
        )
      end
    end
  end
end
