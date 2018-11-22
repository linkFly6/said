// 配置 tsconfig.json 中的 "files" 可以让对应工作目录下的对象自动被扩展


interface Window {
  /**
   * 友盟统计底层代码
   */
  _czc: {
    push: (params: string[]) => void
  }
  /**
   * 友盟统计
   */
  Umeng: {
    /**
     * 友盟统计
     * 文档： http://open.cnzz.com/a/api/trackevent/
     * @param category - 类型：表示事件发生在谁身上，如“视频”、“小说”、“轮显层”等等。
     * @param action - 事件说明：表示访客跟元素交互的行为动作，如"播放"、"收藏"、"翻层"等等。
     * @param label - 事件描述（说明）：用于更详细的描述事件，如具体是哪个视频，哪部小说。
     * @param value - 事件值：用于填写打分型事件的分值，加载时间型事件的时长，订单型事件的价格。请填写整数数值，如果填写为其他形式，系统将按0处理。若填写为浮点小数，系统会自动取整，去掉小数点。
     * @param nodeid - 事件分类 ID：填写事件元素的 div 元素 id
     */
    event: (category: string, action: string, label?: string, value?: number, nodeid?: string) => void
  }
}
