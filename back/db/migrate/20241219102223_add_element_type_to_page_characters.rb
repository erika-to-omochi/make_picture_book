class AddElementTypeToPageCharacters < ActiveRecord::Migration[7.1]
  def change
    add_column :page_characters, :element_type, :string
  end
end
