class CreateLayers
  def initialize(doc:, boring:)
    @doc = doc
    @boring = boring
    @elevation = (@doc.xpath('//孔口標高').text.to_f * 1000).to_i
    @depth = (@doc.xpath('//総掘進長').text.to_f * 1000).to_i
    @top = @elevation
    @bottom = 0
  end

  def call
    create_layers
  end

  private

  def create_layers
    layers = @doc.xpath('//岩石土区分')

    layers.each do |layer|
      next_depth = (layer.xpath('./岩石土区分_下端深度').text.to_f * 1000).to_i
      @bottom = @elevation - next_depth
      Layer.create!(
        boring_id: @boring.id,
        top: @top / 1000.0,
        bottom: @bottom / 1000.0,
        soil_name: layer.xpath('./岩石土区分_岩石土名').text,
        soil_symbol: layer.xpath('./岩石土区分_岩石土名記号').text,
        soil_color: @doc.xpath('//色調').find do |color|
          (color.at_xpath('./色調_下端深度').text.to_f * 1000).to_i == next_depth
        end.at_xpath('./色調_色調名').text
      )
      @top = @bottom
    end
  end
end
