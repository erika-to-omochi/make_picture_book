class RemoveCharacterTypeAndOtherColumnsFromPageCharacters < ActiveRecord::Migration[7.1]
  def change
    # character_type を削除
    remove_column :page_characters, :character_type, :integer
  end
end
