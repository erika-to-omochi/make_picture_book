class CreateBooks < ActiveRecord::Migration[7.1]
  def change
    create_table :books do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.string :author_name, null: false
      t.text :description
      # 公開範囲（enumで定義: 全体、自分のみ）
      t.integer :visibility, null: false, default: 0
      #  下書きか完成作品か
      t.boolean :is_draft, null: false, default: true
      t.timestamps
    end
    add_index :books, :author_name
  end
end
