class RemoveUnnecessaryColumnsFromPageCharacters < ActiveRecord::Migration[7.1]
  def change
    remove_column :page_characters, :simple_path, :string
    remove_column :page_characters, :body_path, :string
    remove_column :page_characters, :hair_path, :string
    remove_column :page_characters, :eye_path, :string
    remove_column :page_characters, :mouth_path, :string
    remove_column :page_characters, :hand_path, :string
    remove_column :page_characters, :foot_path, :string
    remove_column :page_characters, :outfit_path, :string
  end
end
