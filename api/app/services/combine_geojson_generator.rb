class CombineGeojsonGenerator
  def initialize(borings)
    @borings = borings
  end

  def generate_geojson
    {
      type: 'FeatureCollection',
      features: @borings.flat_map { |boring| format_boring_to_features(boring) }
    }.to_json
  end

  def generate_to_file(output_dir:)
    geojson = generate_geojson

    # GeoJSON を整形する
    formatted_geojson = JSON.pretty_generate(JSON.parse(geojson))

    # 書き込み先ディレクトリを確認・作成
    FileUtils.mkdir_p(output_dir) unless Dir.exist?(output_dir)

    # 書き込み
    file_path = File.join(output_dir, "borings.geojson")
    File.open(file_path, 'w') do |file|
      file.write(formatted_geojson)
    end

    file_path # 書き込んだファイルパスを返す
  end

  private

  def format_boring_to_features(boring)
    boring.layers.map do |layer|
      top = layer.top
      bottom = layer.bottom
      middle_height = (top + bottom) / 2

      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [boring.latlon.y, boring.latlon.x] # GeoJSONは[lon, lat]順
        },
        properties: {
          soil_symbol: layer.soil_symbol,
          soil_name: layer.soil_name,
          soil_tone: layer.soil_color,
          top_height: top,
          middle_height: middle_height,
          bottom_height: bottom,
          radius: 1,
          latitude: boring.latlon.x,
          longitude: boring.latlon.y
        }
      }
    end
  end
end
