import { HappyProvider } from "@ant-design/happy-work-theme";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/shell";
import { ConfigProvider, theme } from "antd";
import { isEqual } from "arcdash";
import { RouterProvider } from "react-router-dom";
import { useSnapshot } from "valtio";

const { defaultAlgorithm, darkAlgorithm } = theme;

const App = () => {
	const { isDark } = useTheme();
	const { appearance } = useSnapshot(globalStore);

	useMount(() => {
		initDatabase();

		generateColorVars();

		listen(LISTEN_KEY.GLOBAL_STORE_CHANGED, ({ payload }) => {
			if (isEqual(globalStore, payload)) return;

			Object.assign(globalStore, payload);
		});

		listen(LISTEN_KEY.CLIPBOARD_STORE_CHANGED, ({ payload }) => {
			if (isEqual(clipboardStore, payload)) return;

			Object.assign(clipboardStore, payload);
		});

		watchKey(globalStore.appearance, "language", (value = "zh-CN") => {
			i18n.changeLanguage(value);

			setLocale(value);
		});
	});

	useEventListener("contextmenu", (event) => {
		if (isDev()) return;

		event.preventDefault();
	});

	useEventListener("click", (event) => {
		const link = (event.target as HTMLElement).closest("a");

		if (!link) return;

		const { href, target } = link;

		if (target === "_blank") return;

		event.preventDefault();

		if (!isURL(href)) return;

		open(href);
	});

	useOSKeyPress(["esc", "meta.w"], hideWindow);

	return (
		<ConfigProvider
			locale={getAntdLocale(appearance.language)}
			theme={{
				algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
			}}
		>
			<HappyProvider>
				<RouterProvider router={router} />
			</HappyProvider>
		</ConfigProvider>
	);
};

export default App;
