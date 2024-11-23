class GeojsonsController < ApplicationController
  def create
    require 'geojson_generator'
    boring_id = geojson_params[:kunijiban_id]
    # boring_id = params[:kunijiban_id]
    generator = GeojsonGenerator.new(boring_id)

    # hogeディレクトリにGeoJSONを書き込み
    file_path = generator.generate_to_file(output_dir: './geojsons')

    # ファイルパスをレスポンスに含める（オプション）
    # render json: { message: 'GeoJSON created successfully', file_path: file_path }
    # rescue ActiveRecord::RecordNotFound
    #   render json: { error: 'Boring not found' }, status: :not_found
    # rescue => e
    #   render json: { error: e.message }, status: :internal_server_error
    render status: :created
  end

  private

  def geojson_params
    params.require(:geojson).permit(:kunijiban_id)
  end
end
