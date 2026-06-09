# frozen_string_literal: true

class Public::FeatureItemComponent < ApplicationComponent
  def initialize(icon:, title:, description:)
    @icon = icon
    @title = title
    @description = description
  end
end
