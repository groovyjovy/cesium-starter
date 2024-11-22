module Ratlon
  def self.to_decimal(degree:, minute:, second:)
    degree.to_f + (minute.to_f / 60) + (second.to_f / 3600)
  end
end
