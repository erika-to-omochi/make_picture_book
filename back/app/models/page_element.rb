# app/models/page_element.rb
class PageElement < ApplicationRecord
  belongs_to :page

  ELEMENT_TYPES = %w[text image].freeze

  validates :element_type, presence: true, inclusion: { in: ELEMENT_TYPES }
  validates :position_x, :position_y, :scale_x, :scale_y, presence: true
  validates :text, presence: true, if: -> { element_type == 'text' }
  validates :src, presence: true, if: -> { element_type == 'image' }
  validates :font_size, presence: true, if: -> { element_type == 'text' }
  validates :font_color, presence: true, if: -> { element_type == 'text' }
end
