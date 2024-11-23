class BoringsController < ApplicationController
  def index
    bbox = params.require(:bbox).split(',').map(&:to_f)
    min_lon, min_lat, max_lon, max_lat = bbox

    borings = Boring.where(
      "ST_Contains(
        ST_MakeEnvelope(?, ?, ?, ?, 4326),
        latlon
      )",
      min_lat, min_lon, max_lat, max_lon
    )

    render json: borings
  end

  def create
    require 'utils/latlon'
    require 'layers_creater'

    if Boring.exists?(kunijiban_id: boring_params[:kunijiban_id])
      # 409 Conflict
      render status: :conflict
      return
    end

    # Shift_JISをUTF-8に変換
    xml = nil
    %w[.xml .XML].each do |tail|
      path = "./xmls/#{boring_params[:kunijiban_id]}#{tail}"
      if File.exist?(path)
        xml = File.read(path)
        break
      end
    end

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
          kunijiban_id: boring_params[:kunijiban_id].to_i
        )
        if boring.nil?
          debugger
        end
        LayersCreater.new(doc:, boring:).call
      end
    rescue StandardError => e
      raise e
    end

    # 201 Created
    render status: :created
  end

  private

  def boring_params
    params.require(:boring).permit(:kunijiban_id)
  end
end
