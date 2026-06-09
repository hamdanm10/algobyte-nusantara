# frozen_string_literal: true

class Public::ArticleCardComponent < ApplicationComponent
  def initialize(title:, category:, excerpt:, date:, read_time:)
    @title = title
    @category = category
    @excerpt = excerpt
    @date = date
    @read_time = read_time
  end
end
