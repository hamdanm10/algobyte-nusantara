# frozen_string_literal: true

class Public::PortfolioCardComponent < ApplicationComponent
  def initialize(title:, category:, description:, tags: [])
    @title = title
    @category = category
    @description = description
    @tags = tags
  end
end
