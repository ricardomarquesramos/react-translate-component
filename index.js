'use strict';

var React       = require('react');
var Interpolate = require('react-interpolate-component');
var translator  = require('counterpart');
var extend      = require('object-assign');

var PropTypes = React.PropTypes;

var translatorType = PropTypes.shape({
  getLocale:        PropTypes.func,
  onLocaleChange:   PropTypes.func,
  offLocaleChange:  PropTypes.func,
  translate:        PropTypes.func
});

var Translate = React.createClass({
  displayName: 'Translate',

  contextTypes: {
    translator: translatorType
  },

  propTypes: {
    locale: PropTypes.string,
    count:  PropTypes.number,

    content: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),

    scope: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),

    attributes: PropTypes.object,
    with: PropTypes.object
  },

  statics: {
    textContentComponents: ['title', 'option', 'textarea']
  },

  getDefaultProps: function() {
    return { component: 'span' };
  },

  getInitialState: function() {
    return { locale: this.getTranslator().getLocale() };
  },

  getTranslator: function() {
    return this.context.translator || translator;
  },

  componentDidMount: function() {
    if (!this.props.locale) {
      this.getTranslator().onLocaleChange(this.localeChanged);
    }
  },

  componentWillUnmount: function() {
    if (!this.props.locale) {
      this.getTranslator().offLocaleChange(this.localeChanged);
    }
  },

  localeChanged: function(newLocale) {
    this.setState({ locale: newLocale });
  },

  render: function() {
    var props           = extend({}, this.props);
    var translator      = this.getTranslator();
    var textContent     = Translate.textContentComponents.indexOf(props.component) > -1;
    var interpolate     = textContent || props.unsafe === true;
    var interpolations  = props.with;

    var attributeKey;

    var attributeTranslationOptions = extend(
      { locale: this.state.locale },
      props,
      interpolations,
      { interpolate: true }
    );

    var contentTranslationOptions = extend(
      {},
      attributeTranslationOptions,
      { interpolate: interpolate }
    );

    delete props.locale;
    delete props.scope;
    delete props.separator;
    delete props.fallbackLocale;
    delete props.fallback;
    delete props.count;
    delete props.with;

    if (props.attributes) {
      for (var name in props.attributes) {
        attributeKey = props.attributes[name];

        if (attributeKey) {
          props[name] = translator.translate(attributeKey, attributeTranslationOptions);
        }
      }

      delete props.attributes;
    }

    if (props.content) {
      var translation      = translator.translate(props.content, contentTranslationOptions);
      var interpolateProps = extend({}, props, { with: interpolations });

      delete props.content;
      delete props.children;

      return React.createElement(Interpolate, interpolateProps, translation);
    } else {
      var component = props.component;

      delete props.component;
      delete props.unsafe;

      return React.createElement(component, props);
    }
  }
});

module.exports = Translate;

module.exports.translate = function(key, options) {
  return React.createElement(Translate, extend({}, options, { content: key }));
};

module.exports.translatorType = translatorType;
