//카카오 로그인 에러
export default function AuthErrorPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h1>로그인 처리 중 문제가 발생했습니다.</h1>
      <p>서버 로그를 확인해 주세요.</p>
      <a href="/login" style={{ marginTop: '20px', color: 'blue' }}>로그인 페이지로 돌아가기</a>
    </div>
  );
}