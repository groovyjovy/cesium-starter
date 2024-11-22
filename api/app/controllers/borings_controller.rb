class BoringsController < ApplicationController
  def create
    require 'utils/latlon'
    require 'create_layers'

    # Shift_JISをUTF-8に変換
    xml = File.read('./xmls/sample.xml')

    doc = Nokogiri::XML(xml)
    lat = Ratlon.to_decimal(degree: doc.xpath('//緯度_度').text.to_i, minute: doc.xpath('//緯度_分').text.to_i,
                            second: doc.xpath('//緯度_秒').text.to_i)
    lon = Ratlon.to_decimal(degree: doc.xpath('//経度_度').text.to_i, minute: doc.xpath('//経度_分').text.to_i,
                            second: doc.xpath('//経度_秒').text.to_i)

    begin
      ActiveRecord::Base.transaction do
        boring = Boring.create!(
          dtd_version: doc.at_xpath('//ボーリング情報')['DTD_version'],
          btb_version: doc.internal_subset.system_id,
          survey_name: doc.at_xpath('//調査名'),
          latlon: "POINT(#{lat} #{lon})",
          kunijiban_id: 0
        )
        CreateLayers.new(doc:, boring:).call
      end
    rescue StandardError => e
      raise e
    end

    # 204 No Content
    render status: :no_content
  end
end
