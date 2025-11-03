import { useState, useEffect, useRef } from 'react';
import Turnstile from 'react-turnstile';
import { AtSymbolIcon, LockClosedIcon, IdentificationIcon, CalendarIcon, EnvelopeIcon, UserCircleIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

function cls(...args) { return args.filter(Boolean).join(' '); }

export default function AuthModal({ open, onClose, onSuccess }) {
  const initLogin = { username: '', password: '' };
  const initRegister = { username: '', email: '', password: '', name: '', dateOfBirth: '' };
  const loginValues = useRef({ ...initLogin });
  const registerValues = useRef({ ...initRegister });
  const loginRefs = {
    username: useRef(null),
    password: useRef(null)
  };
  const registerRefs = {
    username: useRef(null),
    email: useRef(null),
    name: useRef(null),
    dateOfBirth: useRef(null),
    password: useRef(null)
  };
  const verifyCodeRef = useRef(null);
  const verifyValue = useRef('');

  const [mode, setMode] = useState('login');
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isVerify = mode === 'verify';

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [turnstile, setTurnstile] = useState(null);
  const [renderKey, setRenderKey] = useState(0);
  const [pendingVerification, setPendingVerification] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const resetLoginInputs = () => {
    loginValues.current = { ...initLogin };
    if (loginRefs.username.current) loginRefs.username.current.value = '';
    if (loginRefs.password.current) loginRefs.password.current.value = '';
  };
  const resetRegisterInputs = () => {
    registerValues.current = { ...initRegister };
    if (registerRefs.username.current) registerRefs.username.current.value = '';
    if (registerRefs.email.current) registerRefs.email.current.value = '';
    if (registerRefs.name.current) registerRefs.name.current.value = '';
    if (registerRefs.dateOfBirth.current) registerRefs.dateOfBirth.current.value = '';
    if (registerRefs.password.current) registerRefs.password.current.value = '';
  };
  const resetVerifyInput = () => {
    verifyValue.current = '';
    if (verifyCodeRef.current) verifyCodeRef.current.value = '';
  };
  const syncLoginInputs = () => {
    if (loginRefs.username.current) loginRefs.username.current.value = loginValues.current.username || '';
    if (loginRefs.password.current) loginRefs.password.current.value = loginValues.current.password || '';
  };
  const syncRegisterInputs = () => {
    if (registerRefs.username.current) registerRefs.username.current.value = registerValues.current.username || '';
    if (registerRefs.email.current) registerRefs.email.current.value = registerValues.current.email || '';
    if (registerRefs.name.current) registerRefs.name.current.value = registerValues.current.name || '';
    if (registerRefs.dateOfBirth.current) registerRefs.dateOfBirth.current.value = registerValues.current.dateOfBirth || '';
    if (registerRefs.password.current) registerRefs.password.current.value = registerValues.current.password || '';
  };

  useEffect(() => {
    if (open) {
      resetLoginInputs();
      resetRegisterInputs();
      resetVerifyInput();
      setErrors({});
      setLoading(false);
      setShowPassword(false);
      setMessage('');
      setSuccess(false);
      setMode('login');
      setPendingVerification(null);
      setTurnstile(null);
      setRenderKey((prev) => prev + 1);
      setResendCooldown(0);
    }
    if (!open) {
      resetLoginInputs();
      resetRegisterInputs();
      resetVerifyInput();
    }
    function escClose(e) {
      if (e.key === 'Escape') onClose?.();
    }
    if (open) {
      document.addEventListener('keydown', escClose);
      return () => document.removeEventListener('keydown', escClose);
    }
  }, [open, onClose]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    setErrors({});
    setMessage('');
    setSuccess(false);
    if (mode === 'login') {
      syncLoginInputs();
      resetVerifyInput();
    } else if (mode === 'register') {
      syncRegisterInputs();
      resetVerifyInput();
    } else if (mode === 'verify') {
      resetVerifyInput();
    }
  }, [mode]);

  const clearInputs = () => {
    Object.values(loginRefs).forEach((ref) => {
      if (ref.current) ref.current.value = '';
    });
    Object.values(registerRefs).forEach((ref) => {
      if (ref.current) ref.current.value = '';
    });
    if (verifyCodeRef.current) verifyCodeRef.current.value = '';
  };

  if (!open) return null;
  const stopPropagation = (e) => e.stopPropagation();

  const handleChangeLogin = (e) => {
    const { name, value } = e.target;
    loginValues.current[name] = value;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };
  const handleChangeRegister = (e) => {
    const { name, value } = e.target;
    registerValues.current[name] = value;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };
  const handleChangeVerify = (e) => {
    verifyValue.current = e.target.value;
    if (errors.verification) setErrors((prev) => ({ ...prev, verification: '' }));
  };

  const validateLogin = () => {
    const { username, password } = loginValues.current;
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Nhập tên đăng nhập';
    if (!password) newErrors.password = 'Nhập mật khẩu';
    else if (password.length < 8) newErrors.password = 'Ít nhất 8 ký tự';
    else if (!/[A-Z]/.test(password)) newErrors.password = 'Cần 1 chữ hoa';
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) newErrors.password = 'Cần 1 ký tự đặc biệt';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = () => {
    const { username, email, password, name, dateOfBirth } = registerValues.current;
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Nhập tên đăng nhập';
    if (!email.trim()) newErrors.email = 'Nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email không hợp lệ';
    if (!password) newErrors.password = 'Nhập mật khẩu';
    else if (password.length < 8) newErrors.password = 'Ít nhất 8 ký tự';
    else if (!/[A-Z]/.test(password)) newErrors.password = 'Cần 1 chữ hoa';
    else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) newErrors.password = 'Cần 1 ký tự đặc biệt';
    if (!name.trim()) newErrors.name = 'Nhập họ tên';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Chọn ngày sinh';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(false);

    if (isVerify) {
      const username = pendingVerification?.username;
      const code = verifyValue.current.trim();
      if (!username) {
        setMessage('Thiếu thông tin người dùng cần xác minh');
        return;
      }
      if (!code) {
        setErrors({ verification: 'Nhập mã xác minh' });
        return;
      }
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, code })
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          setMessage(data.error || data.detail || 'Mã xác minh không hợp lệ');
          setSuccess(false);
          return;
        }
        
        // Hiển thị thông báo thành công
        setMessage('Xác minh email thành công!');
        setSuccess(true);

        // Nếu có mật khẩu tạm thời lưu sau khi đăng ký, tự động đăng nhập
        const tempPassword = pendingVerification?.password;
        if (tempPassword) {
          try {
            const loginRes = await fetch('http://localhost:8000/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password: tempPassword })
            });
            const loginJson = await loginRes.json();
            if (loginRes.ok && loginJson?.success && loginJson?.user) {
              if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(loginJson.user));
              }
              onSuccess?.();
              return;
            }
          } catch (_) {
            // fall back to manual login
          }
        }

        // Nếu không thể tự đăng nhập, chuyển về tab đăng nhập với username đã điền sẵn
        setMode('login');
        setPendingVerification(null);
        if (loginRefs.username.current) {
          loginRefs.username.current.value = username;
        }
        loginValues.current.username = username;
        if (verifyCodeRef.current) verifyCodeRef.current.value = '';
        verifyValue.current = '';
        setMessage('Tài khoản đã được xác minh. Vui lòng đăng nhập.');
        setSuccess(true);
        // Xác minh thành công → Hiển thị thông báo ngắn gọn
        setMessage('Xác minh tài khoản thành công!');
        setSuccess(true);
        
        // Tự động đăng nhập bằng cách gọi API login với thông tin đã lưu
        setTimeout(async () => {
          try {
            // Lấy password từ pending verification (nếu có)
            const password = pendingVerification?.password || '';
            
            if (!password) {
              // Nếu không có password, chuyển về login
              setMode('login');
              setPendingVerification(null);
              if (loginRefs.username.current) {
                loginRefs.username.current.value = username;
              }
              loginValues.current.username = username;
              setMessage('Tài khoản đã được xác minh. Vui lòng đăng nhập.');
              setSuccess(true);
              return;
            }
            
            // Auto login
            const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password, turnstile })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginResponse.ok && loginData.success && loginData.user) {
              // Lưu user vào localStorage
              if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(loginData.user));
              }
              // Giữ thông báo xác minh thành công, không cần thêm "đang đăng nhập"
              setMessage('Xác minh tài khoản thành công!');
              setSuccess(true);
              setTimeout(() => {
                onSuccess?.();
              }, 500);
            } else {
              // Login failed, chuyển về tab login
              setMode('login');
              setPendingVerification(null);
              if (loginRefs.username.current) {
                loginRefs.username.current.value = username;
              }
              loginValues.current.username = username;
              setMessage('Tài khoản đã được xác minh. Vui lòng đăng nhập.');
              setSuccess(true);
            }
          } catch (err) {
            // Error, chuyển về tab login
            setMode('login');
            setPendingVerification(null);
            if (loginRefs.username.current) {
              loginRefs.username.current.value = username;
            }
            loginValues.current.username = username;
            setMessage('Tài khoản đã được xác minh. Vui lòng đăng nhập.');
            setSuccess(true);
          }
        }, 1500);
      } catch (err) {
        setMessage('Lỗi kết nối server khi xác minh');
        setSuccess(false);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!turnstile) {
      setMessage('Vui lòng hoàn thành xác minh người máy');
      setSuccess(false);
      return;
    }

    if (isLogin && !validateLogin()) return;
    if (isRegister && !validateRegister()) return;

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { ...loginValues.current, turnstile } : { ...registerValues.current, turnstile };
      const response = await fetch('http://localhost:8000' + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      // Kiểm tra nếu đăng nhập mà email chưa verify
      if (isLogin && data.needsVerification) {
        const pending = {
          username: loginValues.current.username,
          email: data.email,
          fromLogin: true,
        };
        setPendingVerification(pending);
        setMode('verify');
        setMessage(data.message || 'Email chưa được xác minh. Vui lòng nhập mã xác minh.');
        setSuccess(false);
        setTurnstile(null);
        resetVerifyInput();
        return;
      }

      if (!response.ok || !data.success) {
        setMessage(data.error || data.detail || 'Có lỗi xảy ra');
        setSuccess(false);
        setTurnstile(null);
        return;
      }

      if (isLogin) {
        // Lưu user để Header đọc và cập nhật UI
        // Lưu user vào localStorage
        if (typeof window !== 'undefined' && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        setMessage('Đăng nhập thành công!');
        setSuccess(true);
        onSuccess?.();
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        const pending = {
          username: registerValues.current.username,
          email: registerValues.current.email,
          password: registerValues.current.password,
          password: registerValues.current.password, // Lưu password để auto login sau verify
          code: data.verificationCode,
          emailSent: data.emailSent,
        };
        setPendingVerification(pending);
        setMode('verify');
        setMessage(
          data.emailSent
            ? 'Đăng ký thành công! Mã xác minh đã được gửi tới email của bạn.'
            : 'Đăng ký thành công! Hệ thống chưa gửi được email, vui lòng nhập mã hiển thị bên dưới.'
        );
        setSuccess(true);
        setTurnstile(null);
        resetVerifyInput();
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) {
      console.log('⏳ Còn trong thời gian chờ:', resendCooldown);
      return;
    }
    if (!pendingVerification?.username) {
      console.error('❌ Thiếu thông tin username:', pendingVerification);
      setMessage('Thiếu thông tin người dùng');
      setSuccess(false);
      return;
    }
    
    console.log('📧 Gửi lại mã cho user:', pendingVerification.username);
    setLoading(true);
    setMessage('');
    setSuccess(false);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: pendingVerification.username })
      });
      const data = await response.json();
      console.log('📨 Response:', data);
      
      if (!response.ok || !data.success) {
        setMessage(data.error || data.detail || 'Không thể gửi lại mã');
        setSuccess(false);
        return;
      }
      
      setMessage(
        data.emailSent
          ? 'Mã xác minh mới đã được gửi tới email của bạn.'
          : 'Tạo mã mới thành công. Vui lòng sử dụng mã bên dưới.'
      );
      setSuccess(true);
      setResendCooldown(60);
      
      // Cập nhật mã mới nếu email không gửi được
      if (!data.emailSent && data.verificationCode) {
        setPendingVerification(prev => ({
          ...prev,
          code: data.verificationCode,
          emailSent: false,
        }));
      }
    } catch (error) {
      setMessage('Lỗi kết nối server khi gửi lại mã');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const SimpleInput = ({ name, label, icon: Icon, onChange, type = 'text', show = true, error, inputRef }) => (
    <div style={{ display: show ? '' : 'none' }} className={cls('mb-3')}>
      <label htmlFor={name} className="block mb-1 font-medium text-zinc-800">{label}</label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          autoComplete={name}
          onChange={onChange}
          ref={inputRef}
          defaultValue=""
          required={show}
          className={cls(
            'block w-full h-12 rounded-xl border border-zinc-300 bg-zinc-50 text-base font-medium px-12 focus:ring-2 focus:ring-black focus:border-black outline-none transition shadow-sm',
            error && 'border-red-400'
          )}
        />
        {Icon && <Icon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />}
      </div>
      {error && <div className="flex items-center gap-1 text-xs text-red-600 mt-1 ml-1"><ExclamationCircleIcon className="w-4 h-4" /> {error}</div>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center py-4 px-2 sm:px-0" style={{ backdropFilter: 'blur(12px)', background: 'linear-gradient(103deg,rgba(246,246,248,.97),rgba(0,0,0,.07) 58%,rgba(240,240,244,.88))' }} onClick={onClose}>
      <div className="relative w-full max-w-[400px] animate-fadein-modal" onClick={stopPropagation} style={{ margin: 'auto' }}>
        <div className="flex flex-col items-center gap-3 -mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-zinc-200 to-zinc-50 rounded-full flex items-center justify-center shadow-lg border-[2px] border-white -translate-y-8"><UserCircleIcon className="w-10 h-10 text-black/50" /></div>
        </div>
        <div className="mt-1 bg-white rounded-3xl shadow-4xl p-8 sm:px-8 px-3 border-[1.5px] border-zinc-200 relative" key={renderKey}>
          <button className="absolute right-6 top-5 p-2 bg-white/60 hover:bg-zinc-100 text-zinc-400 hover:text-black rounded-full focus:outline-none border border-transparent hover:border-zinc-200 transition" onClick={onClose} aria-label="Đóng" tabIndex={0}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M6 6l12 12M6 18L18 6" /></svg>
          </button>
          {!isVerify && (
            <div className="flex w-full justify-center mb-7 select-none text-base font-semibold">
              <div className="flex bg-zinc-50 rounded-full border border-zinc-100 shadow-sm overflow-hidden w-fit">
                <button type="button" onClick={() => setMode('login')} className={cls('px-8 py-2 transition-all z-10', isLogin ? 'bg-white text-black shadow font-bold scale-105' : 'text-zinc-400 hover:text-black font-medium')}>Đăng nhập</button>
                <button type="button" onClick={() => setMode('register')} className={cls('px-8 py-2 transition-all z-10', isRegister ? 'bg-white text-black shadow font-bold scale-105' : 'text-zinc-400 hover:text-black font-medium')}>Đăng ký</button>
              </div>
            </div>
          )}
          {isVerify && (
            <div className="mb-6 text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow">
                <ShieldCheckIcon className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-900">Xác minh email</h2>
              <p className="text-sm text-zinc-500">
                {pendingVerification
                  ? pendingVerification.emailSent
                    ? `Mã xác minh đã gửi tới ${pendingVerification.email}.`
                    : 'Hệ thống chưa gửi được email, vui lòng sử dụng mã thử nghiệm bên dưới.'
                  : 'Nhập mã xác minh đã gửi tới email của bạn.'}
              </p>
              {pendingVerification?.code && !pendingVerification?.emailSent && (
                <p className="text-xs text-zinc-400">(Demo) Mã xác minh: <span className="font-semibold text-zinc-900">{pendingVerification.code}</span></p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-1 pt-1">
            {isLogin && (
              <>
                <SimpleInput name="username" label="Tên đăng nhập" icon={AtSymbolIcon} type="text"
                  onChange={handleChangeLogin} error={errors.username} show inputRef={loginRefs.username} />
                <div className="mb-3">
                  <label htmlFor="login-password" className="block mb-1 font-medium text-zinc-800">Mật khẩu</label>
                  <div className="relative">
                    <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" onChange={handleChangeLogin} ref={loginRefs.password} defaultValue="" required
                      className={cls('block w-full h-12 rounded-xl border border-zinc-300 bg-zinc-50 text-base font-medium px-12 focus:ring-2 focus:ring-black focus:border-black outline-none transition shadow-sm', errors.password && 'border-red-400')} />
                    <LockClosedIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <button tabIndex={-1} type="button" aria-label="Hiển thị mật khẩu" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-black">
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <div className="flex items-center gap-1 text-xs text-red-600 mt-1 ml-1"><ExclamationCircleIcon className="w-4 h-4" /> {errors.password}</div>}
                </div>
              </>
            )}
            {isRegister && (
              <>
                <SimpleInput name="username" label="Tên đăng nhập" icon={AtSymbolIcon} type="text"
                  onChange={handleChangeRegister} error={errors.username} show inputRef={registerRefs.username} />
                <SimpleInput name="email" label="Email" icon={EnvelopeIcon} type="email"
                  onChange={handleChangeRegister} error={errors.email} show inputRef={registerRefs.email} />
                <SimpleInput name="name" label="Họ và tên" icon={IdentificationIcon} type="text"
                  onChange={handleChangeRegister} error={errors.name} show inputRef={registerRefs.name} />
                <SimpleInput name="dateOfBirth" label="Ngày sinh" icon={CalendarIcon} type="date"
                  onChange={handleChangeRegister} error={errors.dateOfBirth} show inputRef={registerRefs.dateOfBirth} />
                <div className="mb-3">
                  <label htmlFor="register-password" className="block mb-1 font-medium text-zinc-800">Mật khẩu</label>
                  <div className="relative">
                    <input id="register-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" onChange={handleChangeRegister} ref={registerRefs.password} defaultValue="" required
                      className={cls('block w-full h-12 rounded-xl border border-zinc-300 bg-zinc-50 text-base font-medium px-12 focus:ring-2 focus:ring-black focus:border-black outline-none transition shadow-sm', errors.password && 'border-red-400')} />
                    <LockClosedIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <button tabIndex={-1} type="button" aria-label="Hiển thị mật khẩu" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-black">
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <div className="flex items-center gap-1 text-xs text-red-600 mt-1 ml-1"><ExclamationCircleIcon className="w-4 h-4" /> {errors.password}</div>}
                  <div className="text-xs text-zinc-400 mt-1 ml-1">Ít nhất 8 ký tự, 1 chữ hoa, 1 ký tự đặc biệt</div>
                </div>
              </>
            )}
            {isVerify && (
              <>
                <div className="mb-3">
                  <label htmlFor="verify-code" className="block mb-1 font-medium text-zinc-800">Mã xác minh</label>
                  <input
                    id="verify-code"
                    name="verification"
                    type="text"
                    onChange={handleChangeVerify}
                    ref={verifyCodeRef}
                    defaultValue=""
                    className={cls('block w-full h-12 rounded-xl border border-zinc-300 bg-zinc-50 text-base font-medium px-4 focus:ring-2 focus:ring-black focus:border-black outline-none transition shadow-sm', errors.verification && 'border-red-400')}
                  />
                  {errors.verification && <div className="flex items-center gap-1 text-xs text-red-600 mt-1 ml-1"><ExclamationCircleIcon className="w-4 h-4" /> {errors.verification}</div>}
                </div>
                <div className="flex justify-center mb-4">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    className="text-sm font-medium text-zinc-600 hover:text-black disabled:text-zinc-300 disabled:cursor-not-allowed transition underline"
                  >
                    {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã xác minh'}
                  </button>
                </div>
              </>
            )}

            {!isVerify && (
              <div className="flex justify-center my-5">
                <Turnstile
                  sitekey="1x00000000000000000000AA"
                  theme="light"
                  className="mx-auto border-none"
                  onSuccess={(token) => setTurnstile(token)}
                  onExpire={() => setTurnstile(null)}
                  onError={() => setTurnstile(null)}
                />
              </div>
            )}

            {message && (
              <div className={cls('flex items-center gap-2 p-3 my-3 rounded-xl border-l-4 shadow-lg', success ? 'bg-green-50 border-green-600 text-green-900' : 'bg-red-50 border-red-600 text-red-900')}>
                {success ? <CheckCircleIcon className="w-6 h-6 shrink-0" /> : <ExclamationCircleIcon className="w-6 h-6 shrink-0" />}
                <span className="font-semibold text-base">{message}</span>
              </div>
            )}

            <button
              disabled={loading || (!isVerify && !turnstile)}
              type="submit"
              className="w-full bg-black text-white py-4 shadow-xl rounded-2xl text-lg font-semibold hover:bg-neutral-800 transition-all tracking-wide disabled:opacity-40 flex justify-center items-center gap-2 mt-7 mb-3"
            >
              {loading ? (
                <span className="flex gap-1">
                  <span className="dot-flash2" />
                  <span className="dot-flash2 animation-delay-60" />
                  <span className="dot-flash2 animation-delay-120" />
                </span>
              ) : isVerify ? 'Xác minh email' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </form>
        </div>
        <style jsx>{`
          .animate-fadein-modal { animation: modalfadein .18s cubic-bezier(.51,1.6,.51,1.01); }
          @keyframes modalfadein { from { opacity:.12; transform:scale(.79); } to { opacity:1; transform:none; } }
          .dot-flash2 { display:inline-block; width:7px; height:7px; border-radius:50%; background:#fff; opacity:.8; margin:0 1px; animation:dotflash2 0.9s infinite linear; box-shadow:0 0 5px #3332,0 1px 5px #fff1; }
          .animation-delay-60 { animation-delay:0.11s }
          .animation-delay-120 { animation-delay:0.21s }
          @keyframes dotflash2 { 0% {opacity:.25;} 40% {opacity:1;} 100% {opacity:.25;} }
        `}</style>
      </div>
    </div>
  );
}
