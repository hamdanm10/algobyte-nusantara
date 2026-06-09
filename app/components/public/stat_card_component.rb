# frozen_string_literal: true

class Public::StatCardComponent < ApplicationComponent
  def initialize(value:, label:)
    @value = value
    @label = label
  end
end
