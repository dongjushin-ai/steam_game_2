package io.github.dongjushinai.aikiugi;

import android.app.Activity;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.AnnotatedData;
import com.google.android.gms.games.LeaderboardsClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.leaderboard.LeaderboardScore;
import com.google.android.gms.games.leaderboard.LeaderboardScoreBuffer;
import com.google.android.gms.games.leaderboard.LeaderboardVariant;

/**
 * 구글 플레이 게임즈 리더보드 (v2 SDK).
 * 앱 ID(strings.xml의 game_services_project_id)가 비어 있으면 아무것도 하지 않고 available=false.
 * TOP10은 화면을 직접 그리려고 점수 목록을 그대로 돌려준다.
 */
@CapacitorPlugin(name = "PlayGames")
public class PlayGamesPlugin extends Plugin {

    static boolean configured(Activity a) {
        String id = a.getString(R.string.game_services_project_id);
        return id != null && !id.trim().isEmpty();
    }

    private boolean ready(PluginCall call) {
        if (configured(getActivity())) return true;
        JSObject r = new JSObject();
        r.put("available", false);
        call.resolve(r);
        return false;
    }

    private static int span(String s) {
        if ("daily".equals(s)) return LeaderboardVariant.TIME_SPAN_DAILY;
        if ("weekly".equals(s)) return LeaderboardVariant.TIME_SPAN_WEEKLY;
        return LeaderboardVariant.TIME_SPAN_ALL_TIME;
    }

    private static int collection(String s) {
        return "friends".equals(s) ? LeaderboardVariant.COLLECTION_FRIENDS : LeaderboardVariant.COLLECTION_PUBLIC;
    }

    @PluginMethod
    public void status(PluginCall call) {
        if (!ready(call)) return;
        PlayGames.getGamesSignInClient(getActivity()).isAuthenticated().addOnCompleteListener(t -> {
            boolean ok = t.isSuccessful() && t.getResult().isAuthenticated();
            resolvePlayer(call, ok);
        });
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        if (!ready(call)) return;
        PlayGames.getGamesSignInClient(getActivity()).signIn().addOnCompleteListener(t -> {
            boolean ok = t.isSuccessful() && t.getResult().isAuthenticated();
            resolvePlayer(call, ok);
        });
    }

    private void resolvePlayer(PluginCall call, boolean ok) {
        JSObject r = new JSObject();
        r.put("available", true);
        r.put("authenticated", ok);
        if (!ok) {
            call.resolve(r);
            return;
        }
        PlayGames.getPlayersClient(getActivity()).getCurrentPlayer().addOnCompleteListener(p -> {
            if (p.isSuccessful() && p.getResult() != null) {
                r.put("name", p.getResult().getDisplayName());
                r.put("playerId", p.getResult().getPlayerId());
            }
            call.resolve(r);
        });
    }

    @PluginMethod
    public void submitScore(PluginCall call) {
        if (!ready(call)) return;
        String id = call.getString("id");
        Long score = call.getLong("score");
        if (id == null || id.isEmpty() || score == null) {
            call.reject("id/score required");
            return;
        }
        PlayGames.getLeaderboardsClient(getActivity()).submitScore(id, score);
        call.resolve();
    }

    @PluginMethod
    public void loadTop(PluginCall call) {
        if (!ready(call)) return;
        String id = call.getString("id");
        if (id == null || id.isEmpty()) {
            call.reject("id required");
            return;
        }
        int sp = span(call.getString("span", "all"));
        int col = collection(call.getString("collection", "public"));
        int max = Math.max(1, Math.min(25, call.getInt("max", 10)));
        LeaderboardsClient lb = PlayGames.getLeaderboardsClient(getActivity());
        lb.loadTopScores(id, sp, col, max, true).addOnCompleteListener(t -> {
            JSObject r = new JSObject();
            r.put("available", true);
            JSArray list = new JSArray();
            if (t.isSuccessful() && t.getResult() != null) {
                AnnotatedData<LeaderboardsClient.LeaderboardScores> data = t.getResult();
                LeaderboardsClient.LeaderboardScores scores = data.get();
                if (scores != null) {
                    LeaderboardScoreBuffer buf = scores.getScores();
                    for (LeaderboardScore s : buf) {
                        JSObject e = new JSObject();
                        e.put("rank", s.getRank());
                        e.put("name", s.getScoreHolderDisplayName());
                        e.put("score", s.getRawScore());
                        e.put("display", s.getDisplayScore());
                        e.put("playerId", s.getScoreHolder() != null ? s.getScoreHolder().getPlayerId() : "");
                        list.put(e);
                    }
                    buf.release();
                    scores.release();
                }
            } else {
                r.put("error", t.getException() != null ? t.getException().getMessage() : "load failed");
            }
            r.put("entries", list);
            lb.loadCurrentPlayerLeaderboardScore(id, sp, col).addOnCompleteListener(m -> {
                if (m.isSuccessful() && m.getResult() != null && m.getResult().get() != null) {
                    LeaderboardScore me = m.getResult().get();
                    JSObject e = new JSObject();
                    e.put("rank", me.getRank());
                    e.put("name", me.getScoreHolderDisplayName());
                    e.put("score", me.getRawScore());
                    e.put("display", me.getDisplayScore());
                    r.put("me", e);
                }
                call.resolve(r);
            });
        });
    }

    /** 구글 기본 리더보드 화면 (친구·전체 등 더 보기) */
    @PluginMethod
    public void showLeaderboard(PluginCall call) {
        if (!ready(call)) return;
        String id = call.getString("id");
        LeaderboardsClient lb = PlayGames.getLeaderboardsClient(getActivity());
        (id == null || id.isEmpty() ? lb.getAllLeaderboardsIntent() : lb.getLeaderboardIntent(id)).addOnCompleteListener(t -> {
            if (t.isSuccessful()) getActivity().startActivityForResult(t.getResult(), 9004);
            call.resolve();
        });
    }
}
