require(['jquery', 'so'], function ($, so) {
	'use strict';
	var $name = $('#username'),
		$pass = $('#password'),
		$btn = $('#btn-login'),
		$msgBox = $('#msg'),
		$msg = $msgBox.find('.login-msg-txt'),
		$showPass = $('#showPass'),
		$document = $(document),
		redirectUrl = so.search().re || '/Back/Home/Index',
		isLock = false,
		toggleMsg = {
			show: function (text) {
				$msg.text(text || '');
				$msgBox.stop().fadeIn(300);
			},
			hide: function () {
				$msgBox.stop().fadeOut(300);
			}
		},
		enterSubmit = function (e) {
			if (e.keyCode === 13) $btn.trigger('click');
		};
	$msgBox.on('dblclick', function () {
		toggleMsg.hide();
	});

	$showPass.on('mousedown', function () {
		$pass.attr('type', 'text');
	});
	$document.on('mouseup', function () {
		$pass.attr('type', 'password');
	});
	//输入框逻辑
	$name.on('input', so.debounce(function () {
		var value = $name.val().trim();
		value ? toggleMsg.hide() : toggleMsg.show('请输入正确的用户名');
	}, 300)).on('keydown', enterSubmit)
	$pass.on('input', so.debounce(function () {
		var value = $pass.val().trim();
		value ? toggleMsg.hide() : toggleMsg.show('请输入正确的密码');
	}, 300)).on('keydown', enterSubmit);

	$btn.on('click', function () {
		if (isLock) return;
		var name = $name.val().trim(),
			password = $pass.val().trim();
		if (!name) {
			toggleMsg.show('请输入用户名');
			$name.focus();
			return false;
		}
		if (!password) {
			toggleMsg.show('请输入密码');
			$pass.focus();
			return false;
		}
		$.ajax({
			url: '/Back/Home/Login',
			type: 'post',
			dataType: "json",
			data: { name: name, pwd: password }
		}).done(function (data) {
			if (data.code) {
				toggleMsg.show(data.msg)
				return;
			} else {
				/*
					写到cookie，chrome在localhost域下设置cookie有问题，需要特殊设置域名：
					http://stackoverflow.com/questions/1134290/cookies-on-localhost-with-explicit-domain
					得把localhost的domain设置空字符串
					Chrome version 45.0.2454.85m
				*/
				var domain = document.domain === 'localhost' ? '' : document.domain;
				so.cookie('sh', data.data, 30, '/', domain).cookie('am', name, 30, '/', domain);
				//console.log(so.cookie());
				if (redirectUrl) window.location.replace(redirectUrl);
			}
		}).fail(function (e) {
			//console.log(e);
		});
		return false;
		//$btn.addClass('lock');
		//isLock = true;

	});
	$(function () {
		var name = so.cookie('am');
		if (name) {
			$name.val(name);
			$pass.focus();
		} else
			$name.focus();
	})
});