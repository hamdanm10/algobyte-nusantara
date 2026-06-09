# frozen_string_literal: true

class Public::TeamMemberComponent < ApplicationComponent
  def initialize(name:, role:, initials:, bio:)
    @name = name
    @role = role
    @initials = initials
    @bio = bio
  end
end
