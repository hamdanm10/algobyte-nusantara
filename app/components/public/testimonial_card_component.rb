# frozen_string_literal: true

class Public::TestimonialCardComponent < ApplicationComponent
  def initialize(quote:, name:, role:, initials:)
    @quote = quote
    @name = name
    @role = role
    @initials = initials
  end
end
