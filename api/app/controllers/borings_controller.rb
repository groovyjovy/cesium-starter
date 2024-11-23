class BoringsController < ApplicationController
  def index
    require 'combine_geojson_generator'

    bbox = params.require(:bbox).split(',').map(&:to_f)
    min_lon, min_lat, max_lon, max_lat = bbox

    # 範囲内の `Boring` を取得
    borings = Boring.includes(:layers).where(
      "ST_Contains(
        ST_MakeEnvelope(?, ?, ?, ?, 4326),
        latlon
      )",
      min_lat, min_lon, max_lat, max_lon
    )

    # GeoJSON の生成
    generator = CombineGeojsonGenerator.new(borings)
    geojson = generator.generate_geojson

    # レスポンスとして返す
    render json: JSON.pretty_generate(JSON.parse(geojson)), status: :ok
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
