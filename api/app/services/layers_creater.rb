class LayersCreater
  def initialize(doc:, boring:)
    @doc = doc
    @boring = boring
  end

  def call
    create_layers
  end

  private

  def create_layers
    case @doc.at_xpath('//ボーリング情報')['DTD_version']
    when '1.10'
      LayersCreaterV1_10.new(doc: @doc, boring: @boring).call
    when '2.00'
      LayersCreaterV2_00.new(doc: @doc, boring: @boring).call
    when '2.01'
      LayersCreaterV2_01.new(doc: @doc, boring: @boring).call
    when '2.10'
      LayersCreaterV2_10.new(doc: @doc, boring: @boring).call
    when '3.00'
      LayersCreaterV3_00.new(doc: @doc, boring: @boring).call
    when '4.00'
      LayersCreaterV4_00.new(doc: @doc, boring: @boring).call
    else
      debugger
    end
  end
end

class BaseLayersCreater
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

  def create_layers
    params = determine_params
    layers = @doc.xpath("//#{params[:layer][:base]}")

    layers.each do |layer|
      next_depth = (layer.xpath("./#{params[:layer][:base]}_#{params[:layer][:bottom_depth]}").text.to_f * 1000).to_i
      @bottom = @elevation - next_depth

      created_layer = Layer.create!(
        boring_id: @boring.id,
        top: @top / 1000.0,
        bottom: @bottom / 1000.0,
        soil_name: layer.xpath("./#{params[:layer][:base]}_#{params[:layer][:name]}").text,
        soil_symbol: detect_soil_symbol(layer:, params:),
        soil_color: detect_soil_color(layer:, params:, next_depth:),
      )
      @top = @bottom
    end
  end

  def detect_soil_color(layer:, params:, next_depth:)
    # 層の下端深度に色が記録されている
    # next_depthは現在の層の下端深度
    # 層の配列から現在の層の下端深度と一致する層を探し、その層の色を取得する
    element = @doc.xpath("//#{params[:color][:base]}").find do |color|
    (color.at_xpath("./#{params[:color][:base]}_#{params[:color][:bottom_depth]}").text.to_f * 1000).to_i == next_depth
    end

    if element.nil?
      ''
    else
      element.at_xpath("./#{params[:color][:base]}_#{params[:color][:name]}").text
    end
  end

  def detect_soil_symbol(layer:, params:)
    if layer.xpath("./#{params[:layer][:base]}_#{params[:layer][:symbol]}").text.present?
      layer.xpath("./#{params[:layer][:base]}_#{params[:layer][:symbol]}").text
    else
      # そもそもタグの中に設定されていないことがある
      ''
    end
  end

  def determine_params
    raise NotImplementedError
  end
end

class LayersCreaterV2_00 < BaseLayersCreater
  def initialize(doc:, boring:)
    super
  end

  def determine_params
    {
      layer: {
        base: '土質岩種区分',
        bottom_depth: '下端深度',
        name: '土質岩種区分1',
        symbol: '土質岩種記号1',
      },
      color: {
        base: '色調',
        bottom_depth: '下端深度',
        name: '色調名',
      }
    }
  end
end

class LayersCreaterV2_01 < BaseLayersCreater
  def initialize(doc:, boring:)
    super
  end

  def determine_params
    {
      layer: {
        base: '土質岩種区分',
        bottom_depth: '下端深度',
        name: '土質岩種区分1',
        symbol: '土質岩種記号1',
      },
      color: {
        base: '色調',
        bottom_depth: '下端深度',
        name: '色調名',
      }
    }
  end
end

class LayersCreaterV2_10 < BaseLayersCreater
  def initialize(doc:, boring:)
    super
  end

  def determine_params
    {
      layer: {
        base: '土質岩種区分',
        bottom_depth: '下端深度',
        name: '土質岩種区分1',
        symbol: '土質岩種記号1',
      },
      color: {
        base: '色調',
        bottom_depth: '下端深度',
        name: '色調名',
      }
    }
  end
end

class LayersCreaterV3_00 < BaseLayersCreater
  def initialize(doc:, boring:)
    super
  end

  def detect_soil_symbol(layer:, params:)
    if layer.xpath("./#{params[:layer][:base]}_#{params[:layer][:symbol]}").text.present?
      layer.xpath("./#{params[:layer][:base]}_#{params[:layer][:symbol]}").text
    # 表記揺れがある
    elsif layer.xpath("./#{params[:layer][:base]}_岩石土記号").text.present?
      layer.xpath("./#{params[:layer][:base]}_岩石土記号").text
    # そもそもタグの中に設定されていないことがある
    else
      ''
    end
  end

  def determine_params
    {
      layer: {
        base: '岩石土区分',
        bottom_depth: '下端深度',
        name: '岩石土名',
        symbol: '岩石土名記号',
      },
      color: {
        base: '色調',
        bottom_depth: '下端深度',
        name: '色調名',
      }
    }
  end
end

class LayersCreaterV4_00 < BaseLayersCreater
  def initialize(doc:, boring:)
    super
  end

  def determine_params
    {
      layer: {
        base: '工学的地質区分名現場土質名',
        bottom_depth: '下端深度',
        name: '工学的地質区分名現場土質名',
        symbol: '工学的地質区分名現場土質名記号',
      },
      color: {
        base: '色調',
        bottom_depth: '下端深度',
        name: '色調名',
      }
    }
  end
end

class LayersCreaterV1_10 < BaseLayersCreater
  def initialize(doc:, boring:)
    super
  end

  def determine_params
    {
      layer: {
        base: '地質区分',
        bottom_depth: '深度',
        name: '地質名称',
        symbol: 'not_exist',
      },
      color: {
        base: '色調',
        bottom_depth: '下端深度',
        name: '状態',
      }
    }
  end
end
