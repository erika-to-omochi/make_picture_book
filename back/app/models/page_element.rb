class PageElement < ApplicationRecord
  belongs_to :page

  # Enumの定義
  enum element_type: {
    object: 'object',
    nature: 'nature',
    text: 'text',
    background: 'background',
    image: 'image',
  }

  validates :element_type, presence: true
  validates :content, presence: true
end
