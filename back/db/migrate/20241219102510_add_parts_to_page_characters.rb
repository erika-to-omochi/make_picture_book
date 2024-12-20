class AddPartsToPageCharacters < ActiveRecord::Migration[7.1]
  def change
    add_column :page_characters, :parts, :jsonb
  end
end
