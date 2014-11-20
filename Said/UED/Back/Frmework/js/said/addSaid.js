function loadPage($pageContainer/*elem,elem...*/) {
    /// <summary>
    ///     1: 将qoQuery转换为对象
    ///     &#10;    1.1 - loadPage($pageContainer,elem,elem...)
    /// </summary>
    /// <param name="$pageContainer" type="jQuery">
    ///     jQuery对象，要加载页面的容器
    /// </param>
    /// <param name="elem" type="Element">
    ///     允许为jQuery对象或Element对象
    /// </param>
    /// <returns type="$pageContainer" />
    'use strict';
    if (!($pageContainer instanceof jQuery && $pageContainer.length)) return pageContainer;
    var elems = Array.prototype.slice(arguments, 1), clickEv = function () {
        $pageContainer.load(this.dataset.url);
        //如果dataset为null报错改成：$pageContainer.load(elem.getAttribute('data-url'));
    };
    elems.length && elems.forEach(function (elem) {
        elem.nodeType ?
            elem.addEventListener('click', function (e) {
                clickEv.call(elem, e);
            }) :
            (elem instanceof jQuery) ?
                elem.click(function (e) {
                    clickEv.call(elem[0], e);
                }) : ''

    });
    return $pageContainer;
};