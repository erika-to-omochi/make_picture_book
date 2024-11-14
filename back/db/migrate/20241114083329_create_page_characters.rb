class CreatePageCharacters < ActiveRecord::Migration[7.1]
  def change
    create_table :page_characters do |t|
      t.references :page, null: false, foreign_key: true
      t.integer :character_type, null: false, default: 0 # キャラクターのタイプ（enumでsimpleとdetailedの区別）
      # シンプルなスタンプ画像（MVP用）
      t.string :simple_path

      # 本リリースでの詳細パーツごとの画像パス
      t.string :body_path
      t.string :hair_path
      t.string :eye_path
      t.string :mouth_path
      t.string :hand_path
      t.string :foot_path
      t.string :outfit_path

      # キャラクターの位置、回転、スケール情報
      t.integer :position_x, null: false
      t.integer :position_y, null: false
      t.integer :rotation, default: 0
      t.float :scale_x, default: 1.0
      t.float :scale_y, default: 1.0
      t.timestamps
    end

    add_index :page_characters, :character_type
  end
end
