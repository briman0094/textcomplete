import Dropdown from '../../src/dropdown';
import DropdownItem from '../../src/dropdown-item';
import {createSearchResult} from '../test-helper';
import isUndefined from 'lodash.isundefined';

const assert = require('power-assert');

describe('Dropdown', function () {
  describe('.createElement', function () {
    it('should return a HTMLUListElement under body element', function () {
      var el = Dropdown.createElement();
      assert(el instanceof document.defaultView.HTMLUListElement);
      assert.equal(el.parentNode, document.body);
    });
  });

  describe('#el', function () {
    it('should return a object created by Dropdown.createElement()', function () {
      var result = {};
      var stub = this.sinon.stub(Dropdown, 'createElement', () => { return result; });
      var dropdown = new Dropdown({});
      assert.strictEqual(dropdown.el, result);
      assert(stub.calledOnce);
      assert.strictEqual(dropdown.el, result);
      assert(stub.calledOnce); // Dropdown.createElement is not called.
    });

    context('with className option', function () {
      it('should return a element with the class name', function () {
        var className = 'hello-world';
        var dropdown = new Dropdown({ className: className });
        assert.equal(dropdown.el.className, className);
      });
    });

    context('with style option', function () {
      it('should return a element with custom style attribute', function () {
        var style = { backgroundColor: '#f0f' };
        var dropdown = new Dropdown({ style: style });
        assert.equal(dropdown.el.style.backgroundColor, 'rgb(255, 0, 255)');
      });
    });
  });

  describe('#render', function () {
    var dropdown, searchResult;

    function subject() {
      return dropdown.render([searchResult], { top: 0, left: 0 });
    }

    beforeEach(function () {
      searchResult = createSearchResult();
    });

    it('should return itself', function () {
      dropdown = new Dropdown({});
      assert.strictEqual(subject(), dropdown);
    });

    ['render', 'rendered'].forEach(name => {
      it(`should emit ${name} event`, function () {
        var spy = this.sinon.spy();
        dropdown = new Dropdown({});
        dropdown.on(name, spy);
        subject();
        assert(spy.calledOnce);
      });
    });

    context('when render event default is prevented', function () {
      it('should not emit rendered event', function () {
        var spy = this.sinon.spy();
        dropdown = new Dropdown({});
        dropdown.on('render', e => { e.preventDefault(); });
        dropdown.on('rendered', spy);
        subject();
        assert(!spy.called);
      });
    });

    context('when search results are given', function () {
      it('should append dropdown items with the search results', function () {
        dropdown = new Dropdown({});
        subject();
        assert.equal(dropdown.items.length, 1);
        assert(dropdown.items[0] instanceof DropdownItem);
        assert.equal(dropdown.items[0].searchResult, searchResult);
      });

      context('and it has not been shown', function () {
        beforeEach(function () {
          dropdown = new Dropdown({});
          dropdown.shown = false;
        });

        it('should change #shown from false to true', function () {
          subject();
          assert(dropdown.shown);
        });

        ['show', 'shown'].forEach(eventName => {
          it(`should emit ${eventName} event`, function () {
            var spy = this.sinon.spy();
            dropdown.on(eventName, spy);
            subject();
            assert(spy.calledOnce);
          });
        });

        context('and show event default is prevent', function () {
          it('should not emit shown event', function () {
            var spy = this.sinon.spy();
            dropdown.on('show', e => { e.preventDefault(); });
            dropdown.on('shown', spy);
            subject();
            assert(!spy.called);
          });
        });
      });

      context('and it has been shown', function () {
        beforeEach(function () {
          dropdown = new Dropdown({});
          dropdown.shown = true;
        });

        ['show', 'shown'].forEach(eventName => {
          it(`should not emit ${eventName} event`, function () {
            var spy = this.sinon.spy();
            dropdown = new Dropdown({});
            dropdown.shown = true;
            dropdown.on(eventName, spy);
            subject();
            assert(!spy.called);
          });
        });
      });
    });

    context('when search results are empty', function () {
      function subject_() {
        return dropdown.render([], { top: 0, left: 0 });
      }

      context('and it has been shown', function () {
        beforeEach(function () {
          dropdown = new Dropdown({});
          dropdown.shown = true;
        });

        ['show', 'shown'].forEach(eventName => {
          it(`should not emit ${eventName} event`, function () {
            var spy = this.sinon.spy();
            dropdown.on(eventName, spy);
            subject_();
            assert(!spy.called);
          });
        });
      });

      context('and it has not been shown', function () {
        beforeEach(function () {
          dropdown = new Dropdown({});
          dropdown.shown = false;
        });

        ['show', 'shown'].forEach(eventName => {
          it(`should emit ${eventName} event`, function () {
            var spy = this.sinon.spy();
            dropdown.on(eventName, spy);
            subject();
            assert(spy.calledOnce);
          });
        });
      });
    });

    context('when header option is given', function () {
      var header;

      function sharedExample() {
        it('should show .textcomplete-header', function () {
          subject();
          var el = dropdown.el.childNodes[0];
          assert.equal(el.className, 'textcomplete-header');
        });
      }

      context('and it is a string', function () {
        beforeEach(function () {
          header = 'header';
          dropdown = new Dropdown({ header });
        });

        sharedExample();
      });

      context('and it is a function', function () {
        beforeEach(function () {
          header = this.sinon.spy();
          dropdown = new Dropdown({ header });
        });

        sharedExample();

        it('should call the function with raw search results', function () {
          subject();
          assert(header.calledOnce);
          assert(header.calledWith([searchResult.data]));
        });
      });
    });

    context('when footer option is given', function () {
      var footer;

      function sharedExample() {
        it('should show .textcomplete-footer', function () {
          subject();
          var nodes = dropdown.el.childNodes;
          var el = nodes[nodes.length - 1];
          assert.equal(el.className, 'textcomplete-footer');
        });
      }

      context('and it is a string', function () {
        beforeEach(function () {
          footer = 'footer';
          dropdown = new Dropdown({ footer });
        });

        sharedExample();
      });

      context('and it is a function', function () {
        beforeEach(function () {
          footer = this.sinon.spy();
          dropdown = new Dropdown({ footer });
        });

        sharedExample();

        it('should call the function with raw search results', function () {
          subject();
          assert(footer.calledOnce);
          assert(footer.calledWith([searchResult.data]));
        });
      });
    });
  });

  describe('#deactivate', function () {
    var dropdown;

    beforeEach(function () {
      dropdown = new Dropdown({});
    });

    function subject() {
      return dropdown.deactivate();
    }

    it('should return itself', function () {
      assert.strictEqual(subject(), dropdown);
    });

    it('should empty itself', function () {
      dropdown.append([new DropdownItem(createSearchResult())]);
      assert.equal(dropdown.items.length, 1);
      subject();
      assert.equal(dropdown.items.length, 0);
    });

    context('when it is shown', function () {
      beforeEach(function () {
        dropdown.shown = true;
      });

      it('should change #shown from true to false', function () {
        subject();
        assert(!dropdown.shown);
      });

      ['hide', 'hidden'].forEach(eventName => {
        it(`should emit ${eventName} event`, function () {
          var spy = this.sinon.spy();
          dropdown.on(eventName, spy);
          subject();
          assert(spy.calledOnce);
        });
      });

      context('when hide event default is prevented', function () {
        it('should not emit hidden event', function () {
          var spy = this.sinon.spy();
          dropdown.on('hide', e => { e.preventDefault(); });
          dropdown.on('hidden', spy);
          subject();
          assert(!spy.called);
        });
      });
    });
  });

  describe('#append', function () {
    it('should call #appended of the appended dropdown item', function () {
      var dropdown = new Dropdown({});
      var dropdownItem = new DropdownItem(createSearchResult());
      var stub = this.sinon.stub(dropdownItem, 'appended');
      dropdown.append([dropdownItem]);
      assert(stub.calledOnce);
      assert(stub.calledWith(dropdown));
    });
  });

  describe('#select', function () {
    var dropdown, dropdownItem;

    function subject() {
      dropdown.select(dropdownItem);
    }

    beforeEach(function () {
      dropdown = new Dropdown({});
      dropdownItem = new DropdownItem(createSearchResult());
      dropdown.append([dropdownItem]);
    });

    it('should emit a select event', function () {
      var spy = this.sinon.spy();
      dropdown.on('select', spy);
      subject();
      assert(spy.calledOnce);
      assert(spy.calledWith({ searchResult: dropdownItem.searchResult }));
    });
  });

  describe('#selectActiveItem', function () {
    var dropdown, spy;

    function subject() {
      return dropdown.selectActiveItem(spy);
    }

    beforeEach(function () {
      dropdown = new Dropdown({});
      spy = this.sinon.spy();
    });

    context('when it is shown', function () {
      beforeEach(function () {
        dropdown.show();
      });

      context('and there is an active item', function () {
        var activeItem;

        beforeEach(function () {
          dropdown.render([createSearchResult()], { top: 0, left: 0 });
          activeItem = dropdown.items[0].activate();
        });

        it('should callback with the active DropdownItem', function () {
          subject();
          assert(spy.calledOnce);
          assert(activeItem);
        });

        it('should be deactivated', function () {
          var stub = this.sinon.stub(dropdown, 'deactivate', () => { return dropdown; });
          subject();
          assert(stub.calledOnce);
        });

        it('should emit a select event', function () {
          var listener = this.sinon.spy();
          dropdown.on('select', listener);
          subject();
          assert(listener.calledOnce);
          assert(listener.calledWith({ searchResult: activeItem.searchResult }));
        });
      });

      context('and it does not contain a DropdownItem', function () {
        it('should not callback', function () {
          subject();
          assert(!spy.called);
        });
      });
    });

    context('when it is not shown', function () {
      beforeEach(function () {
        dropdown.hide();
      });

      it('should not callback', function () {
        subject();
        assert(!spy.called);
      });
    });
  });

  describe('#up', function () {
    var dropdown;

    beforeEach(function () {
      dropdown = new Dropdown({});
    });

    context('when it is shown', function () {
      beforeEach(function () {
        dropdown.show();
      });

      context('and it contains DropdownItems', function () {
        it('should activate the previous DropdownItem and callback it', function () {
          dropdown.render([
            createSearchResult(),
            createSearchResult(),
            createSearchResult(),
          ], { top: 0, left: 0 });
          assert(!dropdown.items[0].active);
          assert(!dropdown.items[1].active);
          assert(!dropdown.items[2].active);

          var spy = this.sinon.spy();
          dropdown.up(spy);
          assert(!dropdown.items[0].active);
          assert(!dropdown.items[1].active);
          assert(dropdown.items[2].active);
          assert(spy.calledOnce);
          assert(spy.calledWith(dropdown.items[2]));

          spy.reset();
          dropdown.up(spy);
          assert(!dropdown.items[0].active);
          assert(dropdown.items[1].active);
          assert(!dropdown.items[2].active);
          assert(spy.calledOnce);
          assert(spy.calledWith(dropdown.items[1]));
        });
      });

      context('and it does not contain a DropdownItem', function () {
        it('should not callback', function () {
          var spy = this.sinon.spy();
          dropdown.up(spy);
          assert(!spy.called);
        });
      });
    });

    context('when it is not shown', function () {
      beforeEach(function () {
        dropdown.hide();
      });

      it('should not callback', function () {
        var spy = this.sinon.spy();
        dropdown.up(spy);
        assert(!spy.called);
      });
    });
  });

  describe('#down', function () {
    var dropdown;

    beforeEach(function () {
      dropdown = new Dropdown({});
    });

    context('when it is shown', function () {
      beforeEach(function () {
        dropdown.show();
      });

      context('and it contains DropdownItems', function () {
        it('should activate the next DropdownItem', function () {
          dropdown.render([
            createSearchResult(),
            createSearchResult(),
            createSearchResult(),
          ], { top: 0, left: 0 });
          assert(!dropdown.items[0].active);
          assert(!dropdown.items[1].active);
          assert(!dropdown.items[2].active);

          var spy = this.sinon.spy();
          dropdown.down(spy);
          assert(dropdown.items[0].active);
          assert(!dropdown.items[1].active);
          assert(!dropdown.items[2].active);
          assert(spy.calledOnce);
          assert(spy.calledWith(dropdown.items[0]));

          spy.reset();
          dropdown.down(spy);
          assert(!dropdown.items[0].active);
          assert(dropdown.items[1].active);
          assert(!dropdown.items[2].active);
          assert(spy.calledOnce);
          assert(spy.calledWith(dropdown.items[1]));
        });
      });

      context('and it does not contain a DropdownItem', function () {
        it('should not callback', function () {
          var spy = this.sinon.spy();
          dropdown.down(spy);
          assert(!spy.called);
        });
      });
    });

    context('when it is not shown', function () {
      beforeEach(function () {
        dropdown.hide();
      });

      it('should not callback', function () {
        var spy = this.sinon.spy();
        dropdown.down(spy);
        assert(!spy.called);
      });
    });
  });

  describe('#getActiveItem', function () {
    var dropdown;

    beforeEach(function () {
      dropdown = new Dropdown({});
      dropdown.render([
        createSearchResult(),
        createSearchResult(),
        createSearchResult(),
      ], { top: 0, left: 0 });
    });

    function subject() {
      return dropdown.getActiveItem();
    }

    context('without active item', function () {
      it('should return undefined', function () {
        assert(isUndefined(subject()));
      });
    });

    context('with active item', function () {
      var activeItem;

      beforeEach(function () {
        activeItem = dropdown.items[1].activate();
      });

      it('should return the active item', function () {
        assert.strictEqual(subject(), activeItem);
      });
    });
  });
});
