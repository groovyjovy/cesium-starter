class GeoJsonGenerator
  def initialize(boring_id)
    @boring = Boring.find(boring_id)
    @layers = @boring.layers
    @coordinates = extract_coordinates(@boring.latlon)
  end

  def generate_to_file(output_dir = '')
    geojson = generate_geojson

    # 書き込み先ディレクトリを確認・作成
    FileUtils.mkdir_p(output_dir) unless Dir.exist?(output_dir)

    # 書き込み
    file_path = File.join(output_dir, "#{@boring.id}.geojson")
    File.open(file_path, 'w') do |file|
      file.write(geojson)
    end

    file_path # 書き込んだファイルパスを返す
  end

  private

  def generate_geojson
    {
      type: 'FeatureCollection',
      features: @layers.map { |layer| format_layer_to_feature(layer) }
    }.to_json
  end

  def extract_coordinates(latlon)
    latlon_data = latlon.as_text.match(/POINT\((.*)\)/)[1].split
    [latlon_data[0].to_f, latlon_data[1].to_f]
  end

  def format_layer_to_feature(layer)
    top = layer.top
    bottom = layer.bottom
    middle_height = (top + bottom) / 2
    depth_range = "#{top}m - #{bottom}m"

    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: @coordinates.reverse # GeoJSONは[lon, lat]順
      },
      properties: {
        soil_symbol: layer.soil_symbol,
        soil_name: layer.soil_name,
        soil_tone: layer.soil_color,
        depth_range: depth_range,
        half_depth: (bottom - top) / 2,
        top_height: top,
        middle_height: middle_height,
        bottom_height: bottom,
        radius: 1,
        latitude: @coordinates[1],
        longitude: @coordinates[0]
      }
    }
  end
end
