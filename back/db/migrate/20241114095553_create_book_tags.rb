class CreateBookTags < ActiveRecord::Migration[7.1]
  def change
    create_table :book_tags do |t|
      t.references :book, null: false, foreign_key: true
      t.references :tag, null: false, foreign_key: true
      t.timestamps
    end
    add_index :book_tags, [:book_id, :tag_id], unique: true
  end
end
