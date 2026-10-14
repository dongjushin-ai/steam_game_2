package io.github.dongjushinai.aikiugi;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.games.PlayGamesSdk;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PlayGamesPlugin.class);
        super.onCreate(savedInstanceState);
        // 플레이 게임즈: Play Console에서 받은 프로젝트 ID를 넣었을 때만 켠다 (docs/RELEASE.md)
        if (PlayGamesPlugin.configured(this)) PlayGamesSdk.initialize(this);
    }
}
